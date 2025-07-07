'use client';
import { useState } from 'react';
import { Tabs, Tab, Card, CardBody, Image } from "@nextui-org/react";
import { FaBuilding, FaClock, FaUserFriends, FaChartLine } from 'react-icons/fa';
import DepartmentsManagement from '../components/DepartmentsManagement';
import ShiftsManagement from '../components/ShiftsManagement';
import EmployeeShifts from '../components/EmployeeShifts';

const DepartmentsShifts = () => {
    const [activeTab, setActiveTab] = useState("departments");

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl inline-block">
                            <FaChartLine className="text-white text-4xl" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
                        إدارة الأقسام والشفتات
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        نظام متكامل لإدارة أقسام الشركة وتوزيع الشفتات على الموظفين بشكل فعال
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-xl">
                        <CardBody className="flex flex-col items-center justify-center p-6">
                            <div className="bg-white/20 p-4 rounded-full mb-4">
                                <FaBuilding className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold">إدارة الأقسام</h3>
                            <p className="text-indigo-100 mt-2 text-sm">تنظيم أقسام الشركة وإدارتها</p>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl">
                        <CardBody className="flex flex-col items-center justify-center p-6">
                            <div className="bg-white/20 p-4 rounded-full mb-4">
                                <FaClock className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold">إدارة الشفتات</h3>
                            <p className="text-blue-100 mt-2 text-sm">إنشاء وتعديل شفتات العمل</p>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-xl">
                        <CardBody className="flex flex-col items-center justify-center p-6">
                            <div className="bg-white/20 p-4 rounded-full mb-4">
                                <FaUserFriends className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold">ربط الموظفين</h3>
                            <p className="text-purple-100 mt-2 text-sm">توزيع الموظفين على الشفتات</p>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl shadow-xl">
                        <CardBody className="flex flex-col items-center justify-center p-6">
                            <div className="bg-white/20 p-4 rounded-full mb-4">
                                <FaChartLine className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold">تقارير الأداء</h3>
                            <p className="text-amber-100 mt-2 text-sm">تحليل أداء الأقسام والشفتات</p>
                        </CardBody>
                    </Card>
                </div>

                <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={setActiveTab}
                    aria-label="إدارة الأقسام والشفتات"
                    classNames={{
                        tabList: "bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-0",
                        cursor: "bg-white",
                        tab: "h-16 text-white data-[selected=true]:text-indigo-600 font-medium"
                    }}
                >
                    <Tab
                        key="departments"
                        title={
                            <div className="flex items-center gap-2 px-4">
                                <FaBuilding className="text-xl" />
                                <span>الأقسام</span>
                            </div>
                        }
                    />
                    <Tab
                        key="shifts"
                        title={
                            <div className="flex items-center gap-2 px-4">
                                <FaClock className="text-xl" />
                                <span>الشفتات</span>
                            </div>
                        }
                    />
                    <Tab
                        key="assign"
                        title={
                            <div className="flex items-center gap-2 px-4">
                                <FaUserFriends className="text-xl" />
                                <span>ربط الموظفين</span>
                            </div>
                        }
                    />
                </Tabs>

                <Card className="rounded-2xl shadow-xl border border-gray-200 mt-6 overflow-hidden">
                    <CardBody className="p-0">
                        {activeTab === "departments" ? (
                            <DepartmentsManagement />
                        ) : activeTab === "shifts" ? (
                            <ShiftsManagement />
                        ) : (
                            <EmployeeShifts />
                        )}
                    </CardBody>
                </Card>

                <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-3">تحسين إدارة الموارد البشرية</h3>
                            <p className="text-indigo-100">
                                نظام إدارة الأقسام والشفتات يساعدك على تنظيم عملك وزيادة إنتاجية الموظفين
                                من خلال توزيع المهام بشكل فعال ومتابعة الأداء بدقة.
                            </p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-xl">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/30 w-8 h-8 rounded-md"></div>
                                <div className="bg-white/30 w-8 h-8 rounded-md"></div>
                                <div className="bg-white/30 w-8 h-8 rounded-md"></div>
                                <div className="bg-white/30 w-8 h-8 rounded-md"></div>
                                <div className="bg-white/30 w-8 h-8 rounded-md"></div>
                                <div className="bg-white/30 w-8 h-8 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentsShifts;