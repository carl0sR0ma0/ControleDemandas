namespace Api.Services;

public class FileStorageService(IWebHostEnvironment env, IConfiguration cfg)
{
    private readonly string _root = Path.Combine(env.ContentRootPath, "storage");

    public async Task<(string path, long size)> SaveAsync(IFormFile file, string protocol, CancellationToken ct)
    {
        Directory.CreateDirectory(Path.Combine(_root, protocol));
        var safeName = string.Join("_", file.FileName.Split(Path.GetInvalidFileNameChars()));
        var path = Path.Combine(_root, protocol, $"{DateTime.UtcNow:yyyyMMddHHmmssfff}_{safeName}");
        await using var fs = File.Create(path);
        await file.CopyToAsync(fs, ct);
        return (path, fs.Length);
    }
}
