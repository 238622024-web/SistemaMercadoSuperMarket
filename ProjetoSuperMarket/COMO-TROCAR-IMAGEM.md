# 🖼️ Como Trocar a Imagem de Fundo e Logo da Página de Login

## 📍 Localização

Todas as personalizações estão no arquivo: **`index.html`**

---

## 🏢 TROCAR O LOGO DA EMPRESA

### **Passo 1: Prepare sua logo**

1. Coloque a logo do seu supermercado na pasta: `ProjetoSuperMarket/images/`
   - Exemplo: `logo.png` ou `logo.jpg`
   - **Formatos aceitos:** PNG (recomendado para transparência), JPG, SVG
   - **Tamanho recomendado:** 500x500 pixels ou maior

### **Passo 2: Configure no código**

1. **Abra o arquivo `index.html`**

2. **Procure por esta seção (aproximadamente linha 610):**
   ```html
   <div class="logo-icon">
       <!-- OPÇÃO 1: Logo como IMAGEM (recomendado) -->
       <!-- Para usar sua logo, descomente a linha abaixo e coloque o caminho da sua imagem -->
       <!-- <img src="images/logo.png" alt="Logo SuperMarket"> -->
       
       <!-- OPÇÃO 2: Logo como SVG (padrão - carrinho) -->
       <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
           ...
       </svg>
   </div>
   ```

3. **Para usar sua logo:**
   - **Descomente** a linha da imagem (remova o `<!--` e `-->`)
   - **Comente** ou **delete** o SVG do carrinho
   
   **Resultado:**
   ```html
   <div class="logo-icon">
       <!-- Logo da sua empresa -->
       <img src="images/logo.png" alt="Logo SuperMarket">
   </div>
   ```

### **Ajustes Extras do Logo**

No CSS (aproximadamente linha 166), você pode:

**1. Deixar o logo redondo:**
Descomente esta linha:
```css
.logo-icon { border-radius: 50%; }
```

**2. Ajustar o tamanho do logo:**
```css
.logo-icon {
    width: 150px;   /* Aumente ou diminua */
    height: 150px;  /* Aumente ou diminua */
}
```

**3. Ajustar o espaçamento interno:**
```css
.logo-icon img {
    padding: 10px;  /* Aumente ou diminua */
}
```

---

## 🖼️ TROCAR A IMAGEM DE FUNDO

### **Opção 1: Usar uma imagem local (no seu computador)**

1. **Coloque sua imagem na pasta do projeto:**
   - Crie/use a pasta `images` dentro de `ProjetoSuperMarket`
   - Coloque sua imagem lá (ex: `meu-supermercado.jpg`)

2. **Abra o arquivo `index.html`**

3. **Procure por esta linha (aproximadamente linha 32):**
   ```css
   background-image: url('https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200');
   ```

4. **Troque para:**
   ```css
   background-image: url('images/meu-supermercado.jpg');
   ```

### **Opção 2: Usar uma imagem da internet**

1. **Encontre uma imagem online** (Google Imagens, Unsplash, etc.)

2. **Copie o link direto da imagem** (deve terminar com .jpg, .png, etc.)

3. **Abra o arquivo `index.html`**

4. **Procure por esta linha:**
   ```css
   background-image: url('https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200');
   ```

5. **Cole o link da sua imagem:**
   ```css
   background-image: url('SEU_LINK_AQUI');
   ```

---

## 🎨 Ajustar o Overlay (Camada colorida sobre a imagem)

Se a imagem ficar muito escura ou muito clara, você pode ajustar o overlay:

**Procure por esta linha (aproximadamente linha 45):**
```css
background: linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%);
```

**Ajuste o valor `0.85` (opacidade):**
- `0.5` = mais transparente (imagem mais visível)
- `0.9` = mais opaco (imagem menos visível)
- `0.0` = sem overlay (imagem totalmente visível)

**Exemplo para deixar a imagem mais visível:**
```css
background: linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%);
```

---

## 💡 Dicas

### Para o Logo:
- **Formato PNG** com fundo transparente fica melhor
- **Tamanho:** 500x500 pixels ou maior
- **Peso do arquivo:** Máximo 500KB

### Para a Imagem de Fundo:
- **Tamanho recomendado:** Pelo menos 1920x1080 pixels
- **Formato recomendado:** JPG ou PNG
- **Peso do arquivo:** Não muito pesado (máximo 2MB) para carregar rápido

---

## 🔄 Aplicar as Mudanças

Depois de fazer as alterações:
1. Salve o arquivo `index.html`
2. Recarregue a página no navegador (F5 ou Ctrl+R)
3. Se não aparecer, force o recarregamento: **Ctrl + Shift + R**

---

## 📂 Estrutura de Pastas Recomendada

```
ProjetoSuperMarket/
├── index.html
├── images/
│   ├── logo.png              ← Seu logo aqui
│   └── fundo-supermercado.jpg ← Sua imagem de fundo aqui
```

---

**Precisa de ajuda?** Peça para o Kiro te auxiliar! 😊
