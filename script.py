import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all Arabic text blocks (including spaces, punctuation inside)
    # This is a bit tricky in JSX. We can find text inside tags like >text<
    def replacer(match):
        text = match.group(1)
        # only if contains Arabic characters
        if re.search(r'[\u0600-\u06FF]', text):
            # strip spaces around
            stripped = text.strip()
            if stripped:
                return f'>{{t("{stripped}")}}<'
        return match.group(0)

    new_content = re.sub(r'>([^<]+)<', replacer, content)
    
    # Also need to handle attributes like placeholder="arabic"
    def attr_replacer(match):
        attr = match.group(1)
        text = match.group(2)
        if re.search(r'[\u0600-\u06FF]', text):
            return f'{attr}={{t("{text}")}}'
        return match.group(0)
        
    new_content = re.sub(r'([a-zA-Z0-9_]+)="([^"]+)"', attr_replacer, new_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Processed {filepath}")

import glob
for file in glob.glob('frontend/src/components/*.jsx'):
    process_file(file)

