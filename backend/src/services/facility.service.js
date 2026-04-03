const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllFacilities = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;
  const where = { deletedAt: null };
  if (search) where.name = { contains: search };

  const [facilities, total] = await Promise.all([
    prisma.facilityProfile.findMany({ where, skip, take: limit }),
    prisma.facilityProfile.count({ where })
  ]);
  return { data: facilities, meta: { total, page, limit, totalPages: Math.ceil(total/limit) } };
};

const getFacilityById = async (id) => {
  const profile = await prisma.facilityProfile.findUnique({
    where: { id },
    include: { doctors: true }
  });
  if (!profile || profile.deletedAt) throw Object.assign(new Error('Facility not found'), { statusCode: 404 });
  return profile;
};

const updateFacility = async (id, updateData) => {
  const existing = await getFacilityById(id);
  return prisma.facilityProfile.update({
    where: { id },
    data: updateData
  });
};

module.exports = { getAllFacilities, getFacilityById, updateFacility };
