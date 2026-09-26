import os
import re
import base64
import urllib.request
import zlib

def render_mermaid_to_png(mermaid_code, output_png_path):
    os.makedirs(os.path.dirname(output_png_path), exist_ok=True)
    
    # Method 1: mermaid.ink
    try:
        # base64 urlsafe encoding
        clean_code = mermaid_code.strip()
        encoded = base64.urlsafe_b64encode(clean_code.encode('utf-8')).decode('ascii')
        url = f"https://mermaid.ink/img/{encoded}?bgColor=FFFFFF"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=15) as res:
            if res.status == 200:
                with open(output_png_path, 'wb') as f:
                    f.write(res.read())
                print(f"[OK] Generated via mermaid.ink: {os.path.basename(output_png_path)}")
                return True
    except Exception as e:
        print(f"[mermaid.ink failed: {e}], trying kroki.io fallback...")

    # Method 2: kroki.io
    try:
        compressed = zlib.compress(mermaid_code.encode('utf-8'), 9)
        kroki_encoded = base64.urlsafe_b64encode(compressed).decode('ascii')
        url = f"https://kroki.io/mermaid/png/{kroki_encoded}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=15) as res:
            if res.status == 200:
                with open(output_png_path, 'wb') as f:
                    f.write(res.read())
                print(f"[OK] Generated via kroki.io: {os.path.basename(output_png_path)}")
                return True
    except Exception as e:
        print(f"[kroki.io failed: {e}]")

    return False

def test_extract_and_render(md_path, out_dir):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = re.findall(r'```mermaid\s*\n([\s\S]*?)\n```', content)
    print(f"Found {len(blocks)} mermaid blocks in {os.path.basename(md_path)}")
    
    for idx, block in enumerate(blocks):
        out_path = os.path.join(out_dir, f"{os.path.splitext(os.path.basename(md_path))[0]}_diagram_{idx+1}.png")
        success = render_mermaid_to_png(block, out_path)
        if not success:
            print(f"FAILED on block {idx+1}:\n{block}\n")

if __name__ == "__main__":
    docs_dir = r"d:\xampp\htdocs\ORIO ECOMMERCE\docs"
    img_dir = os.path.join(docs_dir, "diagrams")
    test_extract_and_render(os.path.join(docs_dir, "SRS_CLIENT_PROJECT_OVERVIEW.md"), img_dir)
    test_extract_and_render(os.path.join(docs_dir, "SRS_DEVELOPER_TECHNICAL_SPECIFICATION.md"), img_dir)
