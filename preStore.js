// const Warehouse = require('./models/warehouse');
// const Cargo = require('./models/cargo');

// const warehouses = [
//   { name: 'Warehouse A', availableUnits: 500, conditions: ['Dry'], totalUnits: 500 },
//   { name: 'Warehouse B', availableUnits: 1000, conditions: ['Cold'], totalUnits: 1000 },
//   { name: 'Warehouse C', availableUnits: 200, conditions: ['Dry'], totalUnits: 200 },
// ];

// const cargos = [
//   { cargoId: 'CARGO001', content: 'Books', size: 50, storageCondition: ['Dry'], currentLocation: 'Arrived' },
//   { cargoId: 'CARGO002', content: 'Fruits', size: 200, storageCondition: ['Cold'], currentLocation: 'Arrived' },
//   { cargoId: 'CARGO003', content: 'Electronics', size: 100, storageCondition: ['Dry'], currentLocation: 'Arrived' },
// ];

// Cargo.insertMany(cargos)
//   .then(() => console.log('Cargos added'))
//   .catch((err) => console.log('Error adding cargos:', err));

// Warehouse.insertMany(warehouses)
//   .then(() => console.log('Warehouses added'))
//   .catch((err) => console.log('Error adding warehouses:', err));
