# 📁 Pasta de Imagens

## 🎯 Para que serve esta pasta?

Esta pasta é onde você deve colocar:

1. **Logo da sua empresa** (ex: `logo.png`)
2. **Imagem de fundo do login** (ex: `fundo-supermercado.jpg`)
3. **Outras imagens** que você queira usar no sistema

---

## 📸 Como usar?

### Para o LOGO:

1. Coloque seu arquivo de logo aqui (ex: `logo.png`)
2. Abra o arquivo `index.html`
3. Procure por:
   ```html
   <!-- <img src="images/logo.png" alt="Logo SuperMarket"> -->
   ```
4. Descomente (remova `<!--` e `-->`):
   ```html
   <img src="images/logo.png" alt="Logo SuperMarket">
   ```

### Para a IMAGEM DE FUNDO:

1. Coloque sua foto aqui (ex: `meu-supermercado.jpg`)
2. Abra o arquivo `index.html`
3. Procure por:
   ```css
   background-image: url('https://...');
   ```
4. Troque para:
   ```css
   background-image: url('images/meu-supermercado.jpg');
   ```

---

## ✅ Formatos Recomendados

- **Logo:** PNG (com transparência) ou JPG
- **Fundo:** JPG (melhor para fotos grandes)
- **Tamanho do logo:** 500x500 pixels ou maior
- **Tamanho do fundo:** 1920x1080 pixels ou maior

---

**Dica:** Mantenha os nomes dos arquivos simples, sem espaços ou caracteres especiais.

Exemplos bons: `logo.png`, `fundo.jpg`, `logo-empresa.png`
Exemplos ruins: `Logo da Empresa!.png`, `fundo (1).jpg`
