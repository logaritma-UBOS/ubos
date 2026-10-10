const { prisma } = require("./src/lib/prisma")
async function run() {
  const members = await prisma.teamMember.findMany()
  console.log(members.map(m => ({ name: m.name, whatsapp: m.whatsapp })))
}
run()
