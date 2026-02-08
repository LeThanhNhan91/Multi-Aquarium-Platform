import { EndpointBuilder } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PagedResult, PaginatedParams } from "@/types/baseModel";

/**
 * Interface for CRUD endpoint configuration parameters
 */
export interface CrudEndpointsConfig {
  resourcePath: string; // The URL path for the resource (e.g., 'classrooms', 'products')
  tagType?: string; // Tag type for cache invalidation (defaults to resourcePath)
}

/**
 * Helper function to build all basic CRUD endpoints
 * Usage with createApi: endpoints: (builder) => ({ ...buildCrudEndpoints(builder, 'resource') })
 *
 * @param builder - RTK Query endpoint builder
 * @param config - Resource configuration (path, tags)
 * @returns Object containing all basic CRUD endpoints
 */
export function buildCrudEndpoints<T>(
  builder: EndpointBuilder<any, any, any>,
  config: string | CrudEndpointsConfig,
) {
  // Normalize config
  const resourceConfig =
    typeof config === "string"
      ? { resourcePath: config, tagType: config }
      : config;

  const { resourcePath, tagType = resourcePath } = resourceConfig;

  return {
    /**
     * GET ALL - Retrieves a list of all items (supports pagination and search)
     * Query params: pageIndex, pageSize, search
     */
    getAll: builder.query<ApiResponse<PagedResult<T>>, PaginatedParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.pageIndex)
          queryParams.append("pageIndex", params.pageIndex.toString());
        if (params?.pageSize)
          queryParams.append("pageSize", params.pageSize.toString());
        if (params?.search) queryParams.append("search", params.search);

        const queryString = queryParams.toString();
        return `/${resourcePath}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(
                (item: any) => ({ type: tagType, id: item.id }) as const,
              ),
              { type: tagType, id: "LIST" },
            ]
          : [{ type: tagType, id: "LIST" }],
    }),

    /**
     * GET BY ID - Retrieves a single item by its ID
     */
    getById: builder.query<ApiResponse<T>, string | number>({
      query: (id) => `/${resourcePath}/${id}`,
      providesTags: (result, error, id) => [{ type: tagType, id }],
    }),

    /**
     * SEARCH - Searches for items based on a search term
     * Query params: term (search term)
     */
    search: builder.query<ApiResponse<PagedResult<T>>, string>({
      query: (term) =>
        `/${resourcePath}/search?term=${encodeURIComponent(term)}`,
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(
                (item: any) => ({ type: tagType, id: item.id }) as const,
              ),
              { type: tagType, id: "SEARCH" },
            ]
          : [{ type: tagType, id: "SEARCH" }],
    }),

    /**
     * CREATE - Creates a new item
     */
    create: builder.mutation<ApiResponse<T>, Partial<T>>({
      query: (data) => ({
        url: `/${resourcePath}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: tagType, id: "LIST" }],
    }),

    /**
     * UPDATE - Updates an existing item (PATCH)
     */
    update: builder.mutation<
      ApiResponse<T>,
      { id: string | number; data: Partial<T> }
    >({
      query: ({ id, data }) => ({
        url: `/${resourcePath}/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: tagType, id },
        { type: tagType, id: "LIST" },
      ],
    }),

    /**
     * DELETE - Deletes an item
     */
    delete: builder.mutation<ApiResponse<void>, string | number>({
      query: (id) => ({
        url: `/${resourcePath}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: tagType, id },
        { type: tagType, id: "LIST" },
      ],
    }),
  };
}
