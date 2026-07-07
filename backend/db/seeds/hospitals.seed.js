import hospitals from '../../src/data/hospitals.js';

const departmentMap = new Map();

const normalizeDepartment = (name) => name.trim();

const departments = [];

for (const hospital of hospitals) {
  for (const department of hospital.departments) {
    const normalized = normalizeDepartment(department);

    if (!departmentMap.has(normalized)) {
      departmentMap.set(normalized, true);
      departments.push({ name: normalized });
    }
  }
}

const hospitalRows = hospitals.map((hospital) => ({
  id: hospital.id,
  name: hospital.name.trim(),
  city: hospital.city.trim(),
  address: hospital.address.trim(),
  phone_number: hospital.phone.trim(),
  google_maps_url: hospital.mapsUrl.trim(),
  departments: hospital.departments.map(normalizeDepartment),
}));

const hospitalDepartmentRows = hospitalRows.flatMap((hospital) =>
  hospital.departments.map((department) => ({
    hospital_name: hospital.name,
    department_name: department,
  })),
);

export const seedHospitals = hospitalRows;
export const seedDepartments = departments;
export const seedHospitalDepartments = hospitalDepartmentRows;

export default {
  seedHospitals,
  seedDepartments,
  seedHospitalDepartments,
};