const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDoctorById = async (id) => {
  const profile = await prisma.doctorProfile.findUnique({
    where: { id },
    include: { facility: true, user: { select: { email: true }} }
  });
  if (!profile || profile.deletedAt) throw Object.assign(new Error('Doctor not found'), { statusCode: 404 });
  return profile;
};

const createDoctor = async (data) => {
    let userId = data.userId;
    if (data.email && data.password) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = await prisma.user.create({
            data: { email: data.email, password: hashedPassword, role: 'DOCTOR' }
        });
        userId = newUser.id;
    }
    return prisma.doctorProfile.create({ 
        data: {
           userId: userId,
           firstName: data.firstName,
           lastName: data.lastName,
           licenseNumber: data.licenseNumber,
           specialization: data.specialization,
           facilityId: data.facilityId
        } 
    });
};

const deleteDoctor = async (id) => {
    return await prisma.$transaction(async (tx) => {
        // Soft delete the doctor profile
        const profile = await tx.doctorProfile.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        
        // Cascade cancellation to all pending or active appointments
        await tx.appointment.updateMany({
            where: {
                doctorId: id,
                status: { in: ['PENDING', 'CONFIRMED'] }
            },
            data: { status: 'CANCELLED' }
        });
        
        return profile;
    });
};

const updateDoctor = async (id, updateData) => {
  const existing = await getDoctorById(id);
  return prisma.doctorProfile.update({
    where: { id },
    data: updateData
  });
};

const getAllDoctors = async (page = 1, limit = 10, search = '', facilityId = null) => {
  const skip = (page - 1) * limit;
  const where = { deletedAt: null };
  if (search) where.lastName = { contains: search };
  if (facilityId) where.facilityId = facilityId;

  const [doctors, total] = await Promise.all([
    prisma.doctorProfile.findMany({ 
        where, 
        skip, 
        take: limit, 
        include: { 
            user: { select: { email: true }},
            facility: { select: { id: true, name: true } }
        } 
    }),
    prisma.doctorProfile.count({ where })
  ]);
  return { data: doctors, meta: { total, page, limit, totalPages: Math.ceil(total/limit) } };
};

module.exports = { getDoctorById, createDoctor, deleteDoctor, updateDoctor, getAllDoctors };
