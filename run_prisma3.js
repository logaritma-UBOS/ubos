const { prisma } = require("./src/lib/prisma")
async function run() {
  const members = await prisma.teamMember.findMany()
  console.log(members.map(m => ({ id: m.id, name: m.name, email: m.email })))
}
run()
