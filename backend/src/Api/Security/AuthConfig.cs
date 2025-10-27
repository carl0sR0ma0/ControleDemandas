using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Domain;
using Microsoft.IdentityModel.Tokens;

namespace Api.Security;

public class JwtOptions
{
    public string Issuer { get; set; } = "controle-demandas";
    public string Audience { get; set; } = "controle-demandas";
    public string SigningKey { get; set; } = "troque-esta-chave";
    public int ExpHours { get; set; } = 8;
}

public static class JwtToken
{
    public static string Create(User u, long permMask, JwtOptions opt)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opt.SigningKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var handler = new JwtSecurityTokenHandler();

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, u.Id.ToString()),
            new Claim(ClaimTypes.Name, u.Name),
            new Claim(ClaimTypes.Email, u.Email),
            new Claim(ClaimTypes.Role, u.Role),
            new Claim("perms", permMask.ToString())
        };

        var token = new JwtSecurityToken(opt.Issuer, opt.Audience, claims,
            expires: DateTime.UtcNow.AddHours(opt.ExpHours), signingCredentials: creds);

        return handler.WriteToken(token);
    }
}
