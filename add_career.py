import os
import re

file_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff\StaffContactDetail.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add to state
content = re.sub(
    r'const \[contactLanguage, setContactLanguage\] = useState\(contact\?\.language \|\| \'Vietnamese\'\);',
    r"const [contactLanguage, setContactLanguage] = useState(contact?.language || 'Vietnamese');\n  const [contactCareer, setContactCareer] = useState(contact?.career || '');",
    content
)

# Add to useEffect syncing contact prop
content = re.sub(
    r'setContactLanguage\(contact\.language \|\| \'Vietnamese\'\);',
    r"setContactLanguage(contact.language || 'Vietnamese');\n      setContactCareer(contact.career || '');",
    content
)

# Add to updatedContact payload in handleSaveContactChanges
content = re.sub(
    r'language: contactLanguage,',
    r"language: contactLanguage,\n        career: contactCareer,",
    content
)

# Add to currentSnapshot
content = re.sub(
    r'contactLanguage: String\(contactLanguage \|\| \'\'\)\?\.trim\(\),',
    r"contactLanguage: String(contactLanguage || '')?.trim(),\n        contactCareer: String(contactCareer || '')?.trim(),",
    content
)

# Add to useMemo deps
content = re.sub(
    r'contactLanguage,',
    r"contactLanguage,\n    contactCareer,",
    content
)

# Bind to input in UI
# From:
#                        <input
#                          type="text"
#                          placeholder=""
#                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
#                        />
ui_replacement = r'''<input
                          type="text"
                          value={contactCareer}
                          onChange={(e) => setContactCareer(e.target.value)}
                          placeholder=""
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />'''

content = re.sub(
    r'<input\s+type="text"\s+placeholder=""\s+className="w-full px-2\.5 py-1\.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"\s+/>',
    ui_replacement,
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Added contactCareer to StaffContactDetail.jsx')
