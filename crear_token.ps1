# Paso 1: Generar el Header en JSON y convertirlo a Base64
$jsonHeader = '{"alg":"HS256","typ":"JWT"}'
$base64Header = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($jsonHeader))

echo "HEADER : $base64Header";

# Paso 2: Generar el Payload en JSON y convertirlo a Base64
$jsonPayload = '{"id":1,"nombre":"admin","rol":"admin"}'
$base64Payload = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($jsonPayload))

echo "PAYLOAD : $base64Payload";


# Paso 3: Combinar Header y Payload
$tokenSinFirmar = "$base64Header.$base64Payload"

echo "TOKEN (Sin firmar) : $base64Payload";


# Paso 4: Clave secreta para firmar el token
$secret = "claveSecretaParaJWT"

echo "CLAVE SECRETA : $secret";


# Paso 5: Generar la firma usando HMAC-SHA256
# Utiliza OpenSSL para firmar el token
$signature = echo -n "$base64Header.$base64Payload" | openssl dgst -sha256 -hmac $secret -binary | openssl base64

echo "SIGNATURE : $signature";

# Paso 6: Crear el token firmado
$tokenFirmado = "$tokenSinFirmar.$signature"

# Paso 7: Mostrar el token firmado completo
echo "TOKEN FIRMADO COMPLETO: $tokenFirmado"