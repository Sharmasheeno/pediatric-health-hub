const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDoctorById = async (id) => {
  const profile = await prisma.doctorProfile.findUnique({
    where: { id },
    include: { facility: true }
  });
  if (!profile || profile.deletedAt) throw Object.assign(new Error('Doctor not found'), { statusCode: 404 });
  return profile;
};

const updateDoctor = async (id, updateData) => {
  const existing = await getDoctorById(id);
  return prisma.doctorProfile.update({
    where: { id },
    data: updateData
  });
};

const getAllDoctors = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;
  const where = { deletedAt: null };
  if (search) where.lastName = { contains: search };

  const [doctors, total] = await Promise.all([
    prisma.doctorProfile.findMany({ where, skip, take: limit }),
    prisma.doctorProfile.count({ where })
  ]);
  return { data: doctors, meta: { total, page, limit, totalPages: Math.ceil(total/limit) } };
};

module.exports = { getDoctorById, updateDoctor, getAllDoctors };
