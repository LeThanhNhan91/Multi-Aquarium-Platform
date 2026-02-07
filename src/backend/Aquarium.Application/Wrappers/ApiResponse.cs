namespace Aquarium.Application.Wrappers;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<string> Errors { get; set; }

    public ApiResponse() { }

    public ApiResponse(T data, string message = null)
    {
        Data = data;
        Success = true;
        Message = message;
    }

    public ApiResponse(string message)
    {
        Success = false;
        Message = message;
    }
}