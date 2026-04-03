const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getParentById = async (id) => {
  const profile = await prisma.parentProfile.findUnique({
    where: { id },
    include: { children: true }
  });
  if (!profile || profile.deletedAt) throw Object.assign(new Error('Parent not found'), { statusCode: 404 });
  return profile;
};

const updateParent = async (id, updateData) => {
  const existing = await getParentById(id);
  return prisma.parentProfile.update({
    where: { id },
    data: updateData
  });
};

module.exports = { getParentById, updateParent };
