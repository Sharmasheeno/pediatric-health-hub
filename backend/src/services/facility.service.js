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
    include: { doctors: true, user: { select: { email: true }} }
  });
  if (!profile || profile.deletedAt) throw Object.assign(new Error('Facility not found'), { statusCode: 404 });
  return profile;
};

const createFacility = async (data) => {
    let userId = data.userId;
    if (data.email && data.password) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = await prisma.user.create({
            data: { email: data.email, password: hashedPassword, role: 'FACILITY' }
        });
        userId = newUser.id;
    }
    return prisma.facilityProfile.create({ 
        data: {
           userId: userId,
           name: data.name,
           address: data.address,
           phoneNumber: data.phoneNumber
        } 
    });
};

const deleteFacility = async (id) => {
    return prisma.facilityProfile.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
};

const updateFacility = async (id, updateData) => {
  const existing = await getFacilityById(id);
  return prisma.facilityProfile.update({
    where: { id },
    data: updateData
  });
};

module.exports = { getAllFacilities, getFacilityById, createFacility, deleteFacility, updateFacility };
