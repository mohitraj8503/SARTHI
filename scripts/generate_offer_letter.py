#!/usr/bin/env python3
import os
import sys
import json
import argparse
import subprocess
import docx

import re

def clean_title_case(text):
    if not text:
        return ""
    val = text.strip()
    # Normalize degree prefixes
    if val.lower().startswith("btech"):
        val = re.sub(r'^btech', 'B.Tech', val, flags=re.IGNORECASE)
    elif val.lower().startswith("bca"):
        val = re.sub(r'^bca', 'BCA', val, flags=re.IGNORECASE)
    elif val.lower().startswith("mca"):
        val = re.sub(r'^mca', 'MCA', val, flags=re.IGNORECASE)

    # Normalize IILM
    if "iilm" in val.lower():
        val = re.sub(r'iilm', 'IILM', val, flags=re.IGNORECASE)
        val = re.sub(r'university', 'University', val, flags=re.IGNORECASE)

    words = val.split()
    cased = []
    for w in words:
        if w.startswith("(") or w.endswith(")"):
            inner = w.strip("()")
            c = inner.capitalize() if inner.islower() else inner
            if w.startswith("(") and w.endswith(")"):
                cased.append(f"({c})")
            elif w.startswith("("):
                cased.append(f"({c}")
            else:
                cased.append(f"{c})")
        elif w.islower():
            cased.append(w.capitalize())
        else:
            cased.append(w)
    return " ".join(cased)

def replace_in_paragraph(paragraph, replacements, ref_no=None, offer_date=None, name=None):
    text = paragraph.text
    has_match = False

    # 1. Regex replacement for Reference Number (matches ANY TT-INT-2026-XXXX format in template)
    if ref_no and re.search(r'TT-INT-2026-\d{4}', text):
        text = re.sub(r'TT-INT-2026-\d{4}', ref_no, text)
        has_match = True

    # 2. Regex replacement for Date header
    if offer_date and re.search(r'Date:\s*\d{2}-[A-Za-z]{3}-2026', text):
        text = re.sub(r'Date:\s*\d{2}-[A-Za-z]{3}-2026', f'Date: {offer_date}', text)
        has_match = True

    # 3. Replacements list
    for old_val, new_val in replacements:
        if old_val and old_val in text:
            has_match = True
            text = text.replace(old_val, new_val)

    if has_match:
        if paragraph.runs:
            paragraph.runs[0].text = text
            for r in paragraph.runs[1:]:
                r.text = ""
        else:
            paragraph.text = text

def generate_offer_letter(intern_data, template_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Load Document
    doc = docx.Document(template_path)
    
    # ============================================================
    # ARCHITECTURE RULE (enforced here):
    #   intern_id and reference_no are ALWAYS pre-allocated by the
    #   backend (TypeScript computeInternReferenceAndId) using the
    #   gap-filling algorithm and DB unique constraint.
    #
    #   Python MUST NOT compute or generate new IDs.
    #   Python ONLY renders the PDF with the values supplied.
    #
    #   If intern_id or reference_no are missing, this is a backend
    #   pipeline error — raise immediately so the issue is visible.
    # ============================================================
    intern_id = intern_data.get("intern_id", "").strip()
    ref_no = intern_data.get("reference_no", "").strip()

    if not intern_id:
        raise ValueError(
            "[generate_offer_letter] FATAL: 'intern_id' is missing from intern_data. "
            "Backend must pre-allocate the Permanent Intern ID before calling Python. "
            "Python does NOT generate IDs."
        )
    if not ref_no:
        raise ValueError(
            "[generate_offer_letter] FATAL: 'reference_no' is missing from intern_data. "
            "Backend must pre-allocate the Official Reference Number before calling Python. "
            "Python does NOT generate reference numbers."
        )
        
    # 2. Build Comprehensive Dynamic Replacements with Title Case Formatting
    raw_name = intern_data.get("name", "Student Candidate").strip()
    raw_degree = intern_data.get("degree", "Degree / Program").strip()
    raw_college = intern_data.get("college", "University / Institution").strip()
    raw_city = intern_data.get("city", "Jamshedpur, Jharkhand").strip()
    raw_position = intern_data.get("position", "Software Development").strip()

    name = clean_title_case(raw_name)
    degree = clean_title_case(raw_degree)
    college = clean_title_case(raw_college)
    city = clean_title_case(raw_city)

    # Position Normalization
    garbage_positions = ["experienced", "fresher", "beginner", "student", "none", "n/a", "na", "null", "undefined"]
    if raw_position.lower() in garbage_positions:
        position = "Software Development"
    else:
        position = clean_title_case(raw_position)

    offer_date = intern_data.get("offer_date", "05-Jul-2026").strip()
    start_date = intern_data.get("start_date", "06-Jul-2026").strip()
    end_date = intern_data.get("end_date", "06-Nov-2026").strip()
    joining_date = intern_data.get("joining_date", "06-Jul-2026").strip()
    mentor = intern_data.get("mentor", "Mohit Raj").strip()
    acceptance_deadline = intern_data.get("acceptance_deadline", "").strip()
    duration = intern_data.get("duration", "1 Month").strip()
    stipend = intern_data.get("stipend", "Performance-Based Paid Internship").strip()

    period_str = f"{start_date} - {end_date}"

    # Build dynamic replacement lists for all potential template placeholders
    replacements_list = [
        ("05-Jul-2026", offer_date),
        ("20-Jul-2026", offer_date),
        ("18-Aug-2026", offer_date),
        ("Unpaid (Skill Development Internship)", stipend),
        
        # Reference Number placeholders
        ("TT-INT-2026-0006", ref_no),
        ("TT-INT-2026-0066", ref_no),
        ("TT-INT-2026-0007", ref_no),
        ("TT-INT-2026-0148", ref_no),
        
        # Name placeholders
        ("Mohit Raj", name),
        ("Ranjan Singh", name),
        ("Pranshu Kumar Singh", name),
        ("Keshav Ruhela", name),
        ("Kunal Ranjan", name),
        ("japkirat singh", name),
        ("Japkirat Singh", name),
        
        # Degree placeholders
        ("B.Tech, Artificial Intelligence & Data Science", degree),
        ("BCA Honors with Research (Sem 3)", degree),
        ("B.Tech (Sem 3)", degree),
        ("BCA (Sem 3)", degree),
        ("btech (Sem 3)", degree),
        
        # College placeholders
        ("Arka Jain University", college),
        ("IILM UNIVERSITY GREATER NOIDA ( DELHI )", college),
        ("IILM UNIVERSITY GREATER NOIDA", college),
        ("IILM University", college),
        ("iilm university", college),
        
        # City placeholders
        ("Jamshedpur, Jharkhand", city),
        
        # Position / Track placeholders
        ("Research and Development Intern", position),
        ("Software Development Intern", position),
        ("Software Development", position),
        ("experienced", position),
    ]

    # Process Table 1 (Header metadata & Recipient)
    if len(doc.tables) > 1:
        t1 = doc.tables[1]
        for row in t1.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    replace_in_paragraph(p, replacements_list, ref_no=ref_no, offer_date=offer_date, name=name)

    # Process Table 2 (Internship Details Table)
    if len(doc.tables) > 2:
        t2 = doc.tables[2]
        for row in t2.rows:
            label = row.cells[0].text.strip()
            val_p = row.cells[1].paragraphs[0]
            if label == "Position":
                val_p.text = position
            elif label == "Internship Duration":
                val_p.text = duration
            elif label == "Internship Period":
                val_p.text = period_str
            elif label == "Joining Date":
                val_p.text = joining_date
            elif label == "Stipend":
                val_p.text = stipend

            # Clean any corrupted dash/encoding characters in cell text
            if val_p.text:
                val_p.text = val_p.text.replace('–', '-').replace('—', '-')

    # Process Table 3 (Signatures) - ensure mentor signature label stays Mohit Raj / assigned mentor
    if len(doc.tables) > 3:
        t3 = doc.tables[3]
        if mentor != "Mohit Raj":
            mentor_p = t3.rows[0].cells[1].paragraphs[0]
            replace_in_paragraph(mentor_p, [("Mohit Raj", mentor)])

    # Insert non-refundable bullet point styled list element directly into document paragraph list if not already present
    non_refundable_text = "Please note that receiving this offer letter constitutes your voluntary acceptance of the internship program. By accepting this offer, you acknowledge that all platform administration or registration fees paid during the enrollment process are completely non-refundable."
    
    has_non_refundable = any(non_refundable_text[:30] in p.text for p in doc.paragraphs)
    if not has_non_refundable:
        for i, p in enumerate(doc.paragraphs):
            if "Decisions regarding evaluation and certification remain at the sole discretion of Tech Tomorrow Pvt. Ltd." in p.text:
                new_paragraph = doc.add_paragraph(style='List Bullet')
                new_paragraph.text = non_refundable_text
                new_paragraph.paragraph_format.space_before = docx.shared.Pt(0)
                new_paragraph.paragraph_format.space_after = docx.shared.Pt(3)
                new_paragraph.paragraph_format.line_spacing = 1.15
                p._p.addprevious(new_paragraph._p)
                break

    # Process Main Paragraphs
    replacements_paragraphs = [
        ("Dear Mohit Raj,", f"Dear {name},"),
        ("Dear Mohit Raj", f"Dear {name}"),
        ("Dear Ranjan Singh,", f"Dear {name},"),
        ("Dear Ranjan Singh", f"Dear {name}"),
        ("Dear Pranshu Kumar Singh,", f"Dear {name},"),
        ("Dear Pranshu Kumar Singh", f"Dear {name}"),
        ("Dear Keshav Ruhela,", f"Dear {name},"),
        ("Dear Keshav Ruhela", f"Dear {name}"),
        ("Dear Kunal Ranjan,", f"Dear {name},"),
        ("Dear Kunal Ranjan", f"Dear {name}"),
        ("Research and Development Intern", position),
        ("Software Development", position),
        ("07-Jul-2026", ""),
        (acceptance_deadline, ""),
        ("Kindly confirm your acceptance of this internship offer by signing this letter and returning a scanned copy to us on or before", ""),
        ("We are excited to welcome you to Tech Tomorrow Pvt. Ltd. and look forward to supporting your learning and professional growth.", "")
    ]

    for p in list(doc.paragraphs):
        replace_in_paragraph(p, replacements_paragraphs, ref_no=ref_no, offer_date=offer_date, name=name)
        cleaned_text = p.text.strip().replace(" ", "").replace("\n", "").replace("\r", "")
        # Only remove stray single-dot paragraphs from old template
        if cleaned_text == ".":
            p_element = p._p
            if p_element is not None and p_element.getparent() is not None:
                p_element.getparent().remove(p_element)

    # 4. Save filled docx
    import re
    # Keep spaces in the file name format (e.g. Nitin Sinha_Offer_Letter instead of Nitin_Sinha_Offer_Letter)
    clean_name = name.strip()
    docx_filename = f"{clean_name}_Offer_Letter_Editable_{os.getpid()}.docx"
    pdf_filename = f"{clean_name}_Offer_Letter.pdf"

    docx_path = os.path.join(output_dir, docx_filename)
    pdf_path = os.path.join(output_dir, pdf_filename)

    try:
        doc.save(docx_path)
    except PermissionError:
        docx_path = os.path.join(output_dir, f"{clean_name}_Offer_Letter_Editable_fallback_{os.getpid()}.docx")
        doc.save(docx_path)
    print(f"Saved filled docx: {docx_path}")

    # 5. Convert to PDF via docx2pdf with retry on Windows (or LibreOffice on Linux)
    if os.name == 'nt':
        converted = False
        last_error = None
        for attempt in range(1, 4):
            try:
                print(f"Converting using docx2pdf on Windows (Attempt {attempt})...")
                import pythoncom
                pythoncom.CoInitialize()
                from docx2pdf import convert
                convert(docx_path, pdf_path)
                if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
                    converted = True
                    print(f"Successfully converted docx to pdf using docx2pdf (Attempt {attempt}).")
                    break
            except Exception as e:
                last_error = e
                print(f"docx2pdf attempt {attempt} failed: {e}", file=sys.stderr)
                import time
                time.sleep(1)

        if not converted:
            # Check for soffice in common Windows install locations
            libreoffice_paths = [
                r"C:\Program Files\LibreOffice\program\soffice.exe",
                r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
                "soffice"
            ]
            soffice_exe = None
            for p in libreoffice_paths:
                if os.path.exists(p) or p == "soffice":
                    soffice_exe = p
                    break

            try:
                user_profile_dir = os.path.join(output_dir, f"lo_profile_{os.getpid()}")
                user_profile_uri = user_profile_dir.replace('\\', '/')
                cmd = [
                    soffice_exe or "soffice",
                    f"-env:UserInstallation=file:///{user_profile_uri}",
                    "--headless",
                    "--convert-to", "pdf",
                    "--outdir", output_dir,
                    docx_path
                ]
                result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                if os.path.exists(user_profile_dir):
                    import shutil
                    shutil.rmtree(user_profile_dir, ignore_errors=True)
                if result.returncode == 0 and os.path.exists(pdf_path):
                    converted = True
            except Exception as lo_err:
                print(f"LibreOffice conversion failed: {lo_err}", file=sys.stderr)

        if not converted and not os.path.exists(pdf_path):
            raise RuntimeError(f"PDF conversion failed after retries: {last_error}")
    else:
        user_profile_dir = f"/tmp/libreoffice_profile_{os.getpid()}"
        cmd = [
            "soffice",
            f"-env:UserInstallation=file://{user_profile_dir}",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", output_dir,
            docx_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if os.path.exists(user_profile_dir):
            import shutil
            shutil.rmtree(user_profile_dir, ignore_errors=True)
        if result.returncode != 0:
            print(f"LibreOffice conversion error: {result.stderr}", file=sys.stderr)
            raise RuntimeError(f"LibreOffice PDF conversion failed: {result.stderr}")

    # Rename generated pdf if soffice output name differs
    soffice_pdf = os.path.join(output_dir, f"{clean_name}_Offer_Letter_Editable.pdf")
    if os.path.exists(soffice_pdf) and soffice_pdf != pdf_path:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        os.rename(soffice_pdf, pdf_path)

    # 6. Stamp official signatures onto the generated PDF
    try:
        import fitz
        cwd = os.getcwd()
        sig_mukul_path = os.path.join(cwd, "public", "signature-mukul-pandey.png")
        sig_mohit_path = os.path.join(cwd, "public", "signature-mohit-raj.png")

        if os.path.exists(pdf_path) and os.path.exists(sig_mukul_path) and os.path.exists(sig_mohit_path):
            doc_pdf = fitz.open(pdf_path)
            if len(doc_pdf) >= 2:
                page = doc_pdf[1] # Page 2 (0-indexed 1)
                rects = page.search_for("________________________")
                if len(rects) >= 2:
                    r_mukul = rects[0]
                    r_mohit = rects[1]

                    # Stamp Mukul Pandey Signature (Left)
                    w_mukul = 115
                    h_mukul = w_mukul * (260 / 1024)
                    # Anchor bottom of signature to bottom of underline — sits above the line, not into name text
                    y1_mukul = r_mukul.y1 + 2
                    y0_mukul = y1_mukul - h_mukul
                    rect_mukul = fitz.Rect(r_mukul.x0, y0_mukul, r_mukul.x0 + w_mukul, y1_mukul)
                    page.insert_image(rect_mukul, filename=sig_mukul_path)

                    # Stamp Mohit Raj Signature (Right)
                    w_mohit = 95
                    h_mohit = w_mohit * (282 / 885)
                    # Anchor bottom of signature to bottom of underline — sits above the line, not into name text
                    y1_mohit = r_mohit.y1 + 2
                    y0_mohit = y1_mohit - h_mohit
                    # Center horizontally within the underline bounds
                    mid_x = (r_mohit.x0 + r_mohit.x1) / 2
                    x0_mohit = mid_x - w_mohit / 2
                    x1_mohit = mid_x + w_mohit / 2
                    rect_mohit = fitz.Rect(x0_mohit, y0_mohit, x1_mohit, y1_mohit)
                    page.insert_image(rect_mohit, filename=sig_mohit_path)

                    doc_pdf.saveIncr()
                    print("Successfully stamped signatures onto PDF")
            doc_pdf.close()
    except Exception as e:
        print(f"Warning: Failed to stamp signatures on PDF: {e}", file=sys.stderr)

    print(f"Successfully generated PDF: {pdf_path}")
    return docx_path, pdf_path

def main():
    parser = argparse.ArgumentParser(description="Automated Offer Letter Generator")
    parser.add_argument("--data", help="JSON string or path to JSON file with intern details")
    parser.add_argument("--template", default="/home/mohitraj8503/Documents/techtomorrow/Mohit_Raj_Offer_Letter_Editable.docx")
    parser.add_argument("--outdir", default="/home/mohitraj8503/Documents/techtomorrow/output")
    args = parser.parse_args()

    if not args.data:
        # Default test payload — intern_id and reference_no must always be pre-supplied.
        # Do NOT hardcode real intern IDs here; use this only for local development testing.
        intern_data = {
            "intern_id": "TTI000001",      # Pre-allocated by backend
            "reference_no": "TT-INT-2026-0001",  # Matching reference, pre-allocated by backend
            "name": "Kunal Ranjan",
            "degree": "Computer Science",
            "college": "Arka Jain University",
            "city": "Jamshedpur, Jharkhand",
            "position": "Software Development",
            "offer_date": "05-Jul-2026",
            "start_date": "06-Jul-2026",
            "end_date": "06-Sept-2026",
            "joining_date": "06-Jul-2026",
            "mentor": "Mohit Raj",
            "acceptance_deadline": "08-Jul-2026"
        }
    else:
        if os.path.exists(args.data):
            with open(args.data, "r") as f:
                intern_data = json.load(f)
        else:
            intern_data = json.loads(args.data)

    if isinstance(intern_data, list):
        for item in intern_data:
            generate_offer_letter(item, args.template, args.outdir)
    else:
        generate_offer_letter(intern_data, args.template, args.outdir)

if __name__ == "__main__":
    main()
