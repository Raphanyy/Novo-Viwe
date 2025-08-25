#!/usr/bin/env node

/**
 * GERADOR DE JWT SECRET
 *
 * Este script gera um secret seguro de 256 bits para JWT
 * Use o secret gerado na variável JWT_SECRET do .env
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

console.log("🔐 Gerando JWT Secret...");

// Gerar secret de 256 bits (32 bytes)
const secret = crypto.randomBytes(32).toString("hex");

console.log("✅ JWT Secret gerado com sucesso!");
console.log("");
console.log("📋 COPIE O SECRET ABAIXO:");
console.log("================================");
console.log(secret);
console.log("================================");
console.log("");

// Tentar atualizar .env automaticamente
const envPath = path.join(process.cwd(), ".env");
const envExamplePath = path.join(
  process.cwd(),
  "configs",
  "environment.env.example",
);

if (fs.existsSync(envPath)) {
  try {
    let envContent = fs.readFileSync(envPath, "utf8");

    // Verificar se JWT_SECRET já existe
    if (envContent.includes("JWT_SECRET=")) {
      // Substituir
      envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${secret}`);
      console.log("🔄 Atualizando JWT_SECRET existente no .env...");
    } else {
      // Adicionar
      envContent += `\nJWT_SECRET=${secret}\n`;
      console.log("➕ Adicionando JWT_SECRET ao .env...");
    }

    fs.writeFileSync(envPath, envContent);
    console.log("✅ Arquivo .env atualizado automaticamente!");
  } catch (error) {
    console.log("⚠️  Não foi possível atualizar .env automaticamente");
    console.log("   Adicione manualmente: JWT_SECRET=" + secret);
  }
} else if (fs.existsSync(envExamplePath)) {
  try {
    // Criar .env a partir do example
    let envContent = fs.readFileSync(envExamplePath, "utf8");
    envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${secret}`);

    fs.writeFileSync(envPath, envContent);
    console.log("✅ Arquivo .env criado a partir do template!");
    console.log("📝 Edite o .env e configure suas outras credenciais");
  } catch (error) {
    console.log("⚠️  Não foi possível criar .env automaticamente");
    console.log("   Copie configs/environment.env.example para .env");
    console.log("   E adicione: JWT_SECRET=" + secret);
  }
} else {
  console.log("📝 INSTRUÇÕES:");
  console.log("   1. Copie configs/environment.env.example para .env");
  console.log("   2. Substitua JWT_SECRET=your-256-bit-secret-key-here");
  console.log("   3. Por: JWT_SECRET=" + secret);
}

console.log("");
console.log("🔒 INFORMAÇÕES DE SEGURANÇA:");
console.log("   - Este secret tem 256 bits (32 bytes)");
console.log("   - É criptograficamente seguro");
console.log("   - Mantenha-o PRIVADO e SEGURO");
console.log("   - Nunca commite no Git");
console.log("   - Use diferentes secrets em dev/prod");
console.log("");
console.log("✅ Secret pronto para uso!");
