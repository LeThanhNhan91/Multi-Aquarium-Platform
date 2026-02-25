-- ================================================================
-- Add AverageRating and TotalReviews to Stores
-- ================================================================

USE [MultiStoreAquarium];
GO

PRINT '========================================';
PRINT 'Adding AverageRating and TotalReviews to Stores';
PRINT '========================================';
PRINT '';

-- Add AverageRating column
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'Stores') AND name = 'AverageRating'
)
BEGIN
    PRINT 'Adding AverageRating column to Stores...';
    
    ALTER TABLE Stores
    ADD AverageRating FLOAT NOT NULL DEFAULT 0.0;
    
    PRINT '? AverageRating column added successfully';
END
ELSE
BEGIN
    PRINT '? AverageRating column already exists';
END
GO

-- Add TotalReviews column
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'Stores') AND name = 'TotalReviews'
)
BEGIN
    PRINT 'Adding TotalReviews column to Stores...';
    
    ALTER TABLE Stores
    ADD TotalReviews INT NOT NULL DEFAULT 0;
    
    PRINT '? TotalReviews column added successfully';
END
ELSE
BEGIN
    PRINT '? TotalReviews column already exists';
END
GO

-- Backfill existing data
PRINT '';
PRINT 'Backfilling rating data for existing stores...';

UPDATE s
SET 
    s.AverageRating = ISNULL(
        (SELECT AVG(CAST(sr.Rating AS FLOAT))
         FROM StoreReviews sr
         WHERE sr.StoreId = s.Id AND sr.Status = 'Active'
         GROUP BY sr.StoreId), 0),
    s.TotalReviews = ISNULL(
        (SELECT COUNT(*)
         FROM StoreReviews sr
         WHERE sr.StoreId = s.Id AND sr.Status = 'Active'
         GROUP BY sr.StoreId), 0)
FROM Stores s;

DECLARE @UpdatedStores INT = @@ROWCOUNT;
PRINT '? Updated rating data for ' + CAST(@UpdatedStores AS NVARCHAR(10)) + ' stores';

-- Verify
PRINT '';
PRINT '========================================';
PRINT 'Verification';
PRINT '========================================';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Stores') AND name = 'AverageRating')
    PRINT '? AverageRating column exists';
ELSE
    PRINT '? ERROR: AverageRating column NOT found!';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Stores') AND name = 'TotalReviews')
    PRINT '? TotalReviews column exists';
ELSE
    PRINT '? ERROR: TotalReviews column NOT found!';

-- Show sample data
PRINT '';
PRINT 'Sample Store Ratings:';
SELECT TOP 5
    Name,
    AverageRating,
    TotalReviews,
    Status
FROM Stores
ORDER BY TotalReviews DESC;

PRINT '';
PRINT '========================================';
PRINT 'Migration Complete!';
PRINT '========================================';
GO
