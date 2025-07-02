// src/pages/LeavesAbsences.js
'use client';
import { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import LeavesTable from '../components/LeavesTable';
import AbsencesTable from '../components/AbsencesTable';
import LeaveForm from '../components/LeaveForm';
import AbsenceForm from '../components/AbsenceForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LeavesAbsences = () => {
  const [activeTab, setActiveTab] = useState("leaves");
  const [leaves, setLeaves] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;



  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/leaves`, {
        credentials: 'include',

      });
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      const data = await response.json();
      setLeaves(data.data || data || []); // 
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchAbsences = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/absences`);
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      const data = await response.json();
      setAbsences(data.data || data || []); // 
    } catch (err) {
      toast.error('فشل في جلب بيانات الغياب');
    }
  };

  useEffect(() => {
    if (activeTab === "leaves") fetchLeaves();
    if (activeTab === "absences") fetchAbsences();
  }, [activeTab]);

  const handleLeaveSubmitSuccess = () => {
    setShowLeaveForm(false);
    fetchLeaves();
    toast.success(selectedLeave ? 'تم تحديث الإجازة' : 'تم إضافة إجازة جديدة');
  };

  const handleAbsenceSubmitSuccess = () => {
    setShowAbsenceForm(false);
    fetchAbsences();
    toast.success(selectedAbsence ? 'تم تحديث الغياب' : 'تم إضافة غياب جديد');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">إدارة الإجازات والغياب</h1>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        className="mb-6"
      >
        <Tab key="leaves" title="الإجازات" />
        <Tab key="absences" title="الغياب والتأخير" />
      </Tabs>

      <Card>
        <CardBody>
          {activeTab === "leaves" ? (
            <LeavesTable
              data={leaves}
              onAdd={() => {
                setSelectedLeave(null);
                setShowLeaveForm(true);
              }}
              onEdit={(leave) => {
                setSelectedLeave(leave);
                setShowLeaveForm(true);
              }}
              onRefresh={fetchLeaves}
            />
          ) : (
            <AbsencesTable
              data={absences}
              onAdd={() => {
                setSelectedAbsence(null);
                setShowAbsenceForm(true);
              }}
              onEdit={(absence) => {
                setSelectedAbsence(absence);
                setShowAbsenceForm(true);
              }}
              onRefresh={fetchAbsences}
            />
          )}
        </CardBody>
      </Card>

      {showLeaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <LeaveForm
              leave={selectedLeave}
              onSuccess={handleLeaveSubmitSuccess}
              onCancel={() => setShowLeaveForm(false)}
            />
          </div>
        </div>
      )}

      {showAbsenceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <AbsenceForm
              absence={selectedAbsence}
              onSuccess={handleAbsenceSubmitSuccess}
              onCancel={() => setShowAbsenceForm(false)}
            />
          </div>
        </div>
      )}

      <ToastContainer position="top-center" rtl={true} />
    </div>
  );
};

export default LeavesAbsences;