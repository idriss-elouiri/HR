'use client';
import { useState } from 'react';
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import DepartmentsManagement from '../components/DepartmentsManagement';
import ShiftsManagement from '../components/ShiftsManagement';
import EmployeeShifts from '../components/EmployeeShifts';

const DepartmentsShifts = () => {
    const [activeTab, setActiveTab] = useState("departments");

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">إدارة الأقسام والشفتات</h1>

            <Tabs
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
                className="mb-6"
                color="primary"
            >
                <Tab key="departments" title="الأقسام" />
                <Tab key="shifts" title="الشفتات" />
                <Tab key="assign" title="ربط الموظفين" />
            </Tabs>

            <Card className="shadow-lg">
                <CardBody>
                    {activeTab === "departments" ? (
                        <DepartmentsManagement />
                    ) : activeTab === "shifts" ? (
                        <ShiftsManagement />
                    ) : (
                        <EmployeeShifts />
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default DepartmentsShifts;