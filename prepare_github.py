from pathlib import Path
import shutil
import subprocess
import sys

print("=== Preparar projeto para GitHub Pages ===\n")

# ============================================================
# 1. Perguntar o nome do repositório (com default)
# ============================================================
default_repo = "coruja-matematica"
repo_name = input(f"Nome do repositorio no GitHub [{default_repo}]: ").strip() or default_repo

use_custom_domain = input("Vais usar dominio proprio? (s/N): ").strip().lower() == "s"

if use_custom_domain:
    base_path = "/"
    print(f"  base = '/' (dominio proprio)")
else:
    base_path = f"/{repo_name}/"
    print(f"  base = '{base_path}' (GitHub Pages padrao)")

# ============================================================
# 2. Atualizar vite.config.ts
# ============================================================
vite_path = Path("vite.config.ts")
if vite_path.exists():
    shutil.copy(vite_path, str(vite_path) + ".bak")
    print(f"  backup {vite_path}.bak")

vite_content = f"""import {{ defineConfig }} from 'vite';

export default defineConfig({{
  base: '{base_path}',
  build: {{
    target: 'es2020',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets'
  }}
}});
"""
vite_path.write_text(vite_content, encoding="utf-8", newline="\n")
print(f"  OK {vite_path}")

# ============================================================
# 3. .nojekyll (evita que o GitHub ignore pastas com _)
# ============================================================
nojekyll_path = Path("public/.nojekyll")
nojekyll_path.parent.mkdir(parents=True, exist_ok=True)
nojekyll_path.write_text("", encoding="utf-8")
print(f"  OK {nojekyll_path}")

# ============================================================
# 4. Workflow GitHub Actions
# ============================================================
workflow_path = Path(".github/workflows/deploy.yml")
workflow_path.parent.mkdir(parents=True, exist_ok=True)

workflow_content = """name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run content:build
      - run: npm run build

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
"""
workflow_path.write_text(workflow_content, encoding="utf-8", newline="\n")
print(f"  OK {workflow_path}")

# ============================================================
# 5. Atualizar package.json (scripts e homepage)
# ============================================================
import json

pkg_path = Path("package.json")
shutil.copy(pkg_path, str(pkg_path) + ".bak")
print(f"  backup {pkg_path}.bak")

pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
pkg["homepage"] = f"https://SEU-UTILIZADOR.github.io/{repo_name}/"

# garantir scripts
scripts = pkg.setdefault("scripts", {})
scripts.setdefault("content:build", "node scripts/generate-content.mjs")
scripts["deploy:local"] = "npm run content:build && npm run build"

pkg_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"  OK {pkg_path} (homepage + scripts)")

# ============================================================
# 6. .gitignore (garantir entradas essenciais)
# ============================================================
gitignore_path = Path(".gitignore")
existing = gitignore_path.read_text(encoding="utf-8") if gitignore_path.exists() else ""
required = ["node_modules/", "dist/", "dev-dist/", ".env", ".env.local", ".DS_Store", "*.bak"]
added = []
for entry in required:
    if entry not in existing.splitlines():
        existing += ("\n" if existing and not existing.endswith("\n") else "") + entry + "\n"
        added.append(entry)
if added:
    gitignore_path.write_text(existing, encoding="utf-8", newline="\n")
    print(f"  OK {gitignore_path} (+ {len(added)} entradas)")
else:
    print(f"  OK {gitignore_path} (ja completo)")

# ============================================================
# 7. Teste de build local
# ============================================================
print("\n=== Teste: npm run build local ===\n")
sys.stdout.flush()

# primeiro garantir que os 360 exercicios existem
r1 = subprocess.run("npm run content:build", shell=True, capture_output=True, text=True)
if r1.returncode != 0:
    print("AVISO: content:build falhou")
    print(r1.stdout)
    print(r1.stderr)

r2 = subprocess.run("npm run build", shell=True)
if r2.returncode != 0:
    print("\nBUILD FALHOU. Verifica os erros acima.")
    sys.exit(1)

# ============================================================
# 8. Resumo e instrucoes
# ============================================================
print("\n" + "=" * 60)
print("TUDO PRONTO. Agora segue estes passos MANUAIS:")
print("=" * 60)
print(f"""
1. Cria um repositorio no GitHub chamado '{repo_name}':
   https://github.com/new

2. NAO inicializes com README, .gitignore ou licenca. Deixa vazio.

3. No terminal, na pasta do projeto, corre:

   git init
   git add .
   git commit -m "Coruja Matematica v1.0"
   git branch -M main
   git remote add origin https://github.com/SEU-UTILIZADOR/{repo_name}.git
   git push -u origin main

   (substitui SEU-UTILIZADOR pelo teu username do GitHub)

4. No GitHub, vai a Settings > Pages:
   - Source: GitHub Actions
   - Guardar

5. Volta a Settings > Actions > General:
   - Workflow permissions: "Read and write permissions"
   - Guardar

6. O deploy arranca sozinho. Em ~2 minutos:
   https://SEU-UTILIZADOR.github.io/{repo_name}/

7. Podes acompanhar o progresso em:
   https://github.com/SEU-UTILIZADOR/{repo_name}/actions
""")

if use_custom_domain:
    print("""
DOMINIO PROPRIO:
- Em Settings > Pages > Custom domain: escreve o teu dominio
- Cria um CNAME no DNS a apontar para SEU-UTILIZADOR.github.io
""")
else:
    print(f"""
NOTA: Se quiseres dominio proprio mais tarde, muda o
'base' em vite.config.ts de '/{repo_name}/' para '/'.
""")

print("=" * 60)