#!/usr/bin/env node

/**
 * GERADOR DE JWT SECRET
 *
 * Este script gera um secret seguro de 256 bits para JWT
 * Use o secret gerado na variável JWT_SECRET do .env
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

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
} else {
  console.log("📝 INSTRUÇÕES:");
  console.log("   1. Crie um arquivo .env na raiz do projeto");
  console.log("   2. Adicione: JWT_SECRET=" + secret);
  console.log("   3. Configure suas outras credenciais");
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
