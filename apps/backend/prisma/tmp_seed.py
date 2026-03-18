import re

with open('d:/quan_ly_kho_celebi/apps/backend/prisma/seed-serial.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'inbound_items', 'inbound_requests'", "'trade_in_items'")

# Remove the entire INBOUND TEST DATA section
content = re.sub(r'  // ===========================\n  // INBOUND TEST DATA.*?  console\.log\(\'✅ Seeding completed!\'\)', "  console.log('✅ Seeding completed!')", content, flags=re.DOTALL)

# Remove the summary lines for inbound
content = re.sub(r'- Inbound Requests: 3 \(1 Requested, 1 In Progress, 1 Completed\)\n- Inbound Items: 6 \(5 pending, 1 received\)', '- Trade-In Items: 0', content)

with open('d:/quan_ly_kho_celebi/apps/backend/prisma/seed-serial.ts', 'w', encoding='utf-8') as f:
    f.write(content)
