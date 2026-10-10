const fs = require("fs")
const file = "src/app/(dashboard)/katalog/BulkSupplierModal.tsx"
let content = fs.readFileSync(file, "utf8")
content = content.replace(/setTimeout\(\(\) => \{\n          router\.refresh\(\)\n          onClose\(\)\n        \}, 1500\)/g, "router.refresh()\n        onClose()")
fs.writeFileSync(file, content)
