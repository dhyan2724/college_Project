import React, { useState } from 'react';
import api from '../services/api';

const registerTypes = [
  { value: 'ChemicalItemIssued', label: 'Chemical Item Issued' },
  { value: 'GlasswareItemIssued', label: 'Glassware Item Issued' },
  { value: 'PlasticwareItemIssued', label: 'Plasticware Item Issued' },
  { value: 'InstrumentUsed', label: 'Instrument Used' },
  { value: 'BreakageCharges', label: 'Breakage Charges' },
  { value: 'DailyEntry', label: 'Daily Entry (Research)' },
  { value: 'AnimalCultureLab', label: 'Animal Culture Lab (Research)' },
  { value: 'PlantCultureLab', label: 'Plant Culture Lab (Research)' },
];

const labTypes = [
  { value: 'Common', label: 'Common Lab' },
  { value: 'Research', label: 'Research Lab' },
];

const RegisterBookForm = () => {
  const [registerType, setRegisterType] = useState('ChemicalItemIssued');
  const [labType, setLabType] = useState('Common');
  const [name, setName] = useState('');
  const [facultyInCharge, setFacultyInCharge] = useState('');
  const [item, setItem] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [purpose, setPurpose] = useState('');
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createLabRegister({
        registerType,
        labType,
        name,
        facultyInCharge,
        item,
        totalWeight: totalWeight ? parseFloat(totalWeight) : undefined,
        purpose,
        inTime,
        outTime
      });
      alert('Register entry submitted!');
      setName('');
      setFacultyInCharge('');
      setItem('');
      setTotalWeight('');
      setPurpose('');
      setInTime('');
      setOutTime('');
    } catch (error) {
      alert('Failed to submit: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Lab Register Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Register Type</label>
          <select value={registerType} onChange={e => setRegisterType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
            {registerTypes.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Lab Type</label>
          <select value={labType} onChange={e => setLabType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
            {labTypes.map(lt => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Faculty In Charge</label>
          <input type="text" value={facultyInCharge} onChange={e => setFacultyInCharge(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Item</label>
          <input type="text" value={item} onChange={e => setItem(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Weight (g)</label>
          <input type="number" value={totalWeight} onChange={e => setTotalWeight(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Purpose</label>
          <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">In Time</label>
          <input type="time" value={inTime} onChange={e => setInTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Out Time</label>
          <input type="time" value={outTime} onChange={e => setOutTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div className="flex space-x-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterBookForm; 