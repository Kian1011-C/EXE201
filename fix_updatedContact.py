import os
import re

file_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff\StaffContactDetail.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r'''    const updatedContact = {
      ...(contact || {}),
      firstName: primaryFirstName,
      middleName: primaryMiddleName,
      lastName: primaryLastName,
      fullName: currentFullName,
      name: currentFullName,
      phone: contactPhone,
      email: contactEmail,
      language: contactLanguage,
      contactOwner: leadContactOwner,
      leadOwner: leadContactOwner,
      howDoYouKnowUs: leadHowDoYouKnowUs,
      whoReferClient: leadWhoRefer,
      address: enrolledAddress,
      enrolledAddress: enrolledAddress,
      mailingAddress: mailingAddress,
      streetAddress: streetAddress,
      city: city,
      state: contactState,
      zipCode: postalCode,
      county: county,
      contactFields: {'''

content = re.sub(
    r'    const updatedContact = \{\s*\.\.\.\(contact \|\| \{\}\),\s*firstName: primaryFirstName,\s*middleName: primaryMiddleName,\s*lastName: primaryLastName,\s*fullName: currentFullName,\s*name: currentFullName,\s*phone: contactPhone,\s*email: contactEmail,\s*language: contactLanguage,\s*contactOwner: leadContactOwner,\s*leadOwner: leadContactOwner,\s*howDoYouKnowUs: leadHowDoYouKnowUs,\s*whoReferClient: leadWhoRefer,\s*enrolledAddress: enrolledAddress,\s*mailingAddress: mailingAddress,\s*contactFields: \{',
    replacement,
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated StaffContactDetail.jsx')
