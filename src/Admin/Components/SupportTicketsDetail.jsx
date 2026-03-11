import { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { baseUrl } from '../../utils/ApiConstants';

const getRolePill = (role) => {
    const key = (role || '').toLowerCase();
    if (key.includes('rmg')) return 'bg-purple-100 text-purple-700';
    if (key.includes('candidate')) return 'bg-pink-100 text-pink-700';
    if (key.includes('admin')) return 'bg-blue-100 text-blue-700';
    if (key.includes('recruiter')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-gray-100 text-gray-700';
};

const getPriorityPill = (priority) => {
    if (priority === 'High') return 'bg-red-100 text-red-600';
    if (priority === 'Medium') return 'bg-amber-100 text-amber-700';
    if (priority === 'Low') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
};

const getStatusPill = (status) => {
    if (status === 'Closed') return 'bg-green-100 text-green-700';
    if (status === 'Resolved') return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700';
};

const getStatusLabel = (status) => {
    if (status === 'Open') return 'Pending';
    return status || 'Pending';
};

const SupportTicketDetail = ({ isOpen, onClose, selectedTicket, onTicketUpdated }) => {
    const [status, setStatus] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (selectedTicket && selectedTicket.raisedBy && selectedTicket.raisedBy._id) {
            setAssignedTo(selectedTicket.raisedBy._id);
        } else {
            setAssignedTo('');
        }
        setStatus('');
    }, [selectedTicket, isOpen]);

    const handleUpdateTicket = async () => {
        if (!selectedTicket || !selectedTicket._id) return;

        setIsUpdating(true);
        try {
            const updateData = {};
            if (status) updateData.status = status;
            if (assignedTo) updateData.assignedTo = assignedTo;

            const res = await axios.put(`${baseUrl}/tickets/${selectedTicket._id}`, updateData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            alert('Ticket updated successfully');

            if (res.data.success) {
                onTicketUpdated?.({ _id: selectedTicket._id, status: status || selectedTicket.status });
                setStatus('');
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    className="w-full max-w-[450px] max-h-[85vh] bg-white rounded-[22px] shadow-xl relative flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
                        <div className="relative flex items-center justify-center">
                            <div className="text-xl font-semibold text-gray-900">Support Ticket Details</div>
                            <button
                                onClick={onClose}
                                className="absolute right-0 top-0 w-9 h-9 grid place-items-center rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5 text-gray-900" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {selectedTicket ? (
                            <>
                                <div className="flex items-center justify-center">
                                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${getRolePill(selectedTicket.role)}`}>
                                        {selectedTicket.role}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2 text-[15px]">
                                    <div className="flex justify-center gap-2 flex-wrap">
                                        <div className="font-semibold text-gray-900">Subject :</div>
                                        <div className="text-gray-700">{selectedTicket.subject}</div>
                                    </div>

                                    <div className="flex justify-center gap-2 flex-wrap">
                                        <div className="font-semibold text-gray-900">Raised By :</div>
                                        <div className="text-gray-700">{selectedTicket.reporter}</div>
                                    </div>

                                    {selectedTicket.email && (
                                        <div className="flex justify-center gap-2 flex-wrap">
                                            <div className="font-semibold text-gray-900">Email :</div>
                                            <div className="text-gray-700">{selectedTicket.email}</div>
                                        </div>
                                    )}

                                    <div className="flex justify-center gap-2 flex-wrap">
                                        <div className="font-semibold text-gray-900">Created Date :</div>
                                        <div className="text-gray-700">{selectedTicket.startDate}</div>
                                    </div>

                                    <div className="flex justify-center gap-2 flex-wrap">
                                        <div className="font-semibold text-gray-900">Updated Date :</div>
                                        <div className="text-gray-700">{selectedTicket.dueDate}</div>
                                    </div>

                                    {selectedTicket.assignedTo && (
                                        <div className="flex justify-center gap-2 flex-wrap">
                                            <div className="font-semibold text-gray-900">Assigned to :</div>
                                            <div className="text-gray-700">
                                                {selectedTicket.assignedTo?.name || selectedTicket.assignedTo}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-center gap-8 pt-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold text-gray-900">Priority :</div>
                                            <span className={`px-4 py-1 rounded-full text-sm font-medium ${getPriorityPill(selectedTicket.priority)}`}>
                                                {selectedTicket.priority || 'Normal'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold text-gray-900">Status :</div>
                                            <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusPill(selectedTicket.status)}`}>
                                                {getStatusLabel(selectedTicket.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-dashed border-gray-300" />

                                <div className="pt-4 pb-3 text-center">
                                    <div className="text-base font-semibold text-gray-900 mb-2">Description</div>
                                    <div className="mx-auto max-w-md text-sm text-gray-600 leading-relaxed px-2">
                                        {selectedTicket.description || 'No description provided'}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <div className="text-sm font-semibold text-gray-900 mb-2">Update Status</div>

                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Open">Pending</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>

                                    <input type="text" value={assignedTo} readOnly className="hidden" />

                                    <button
                                        onClick={handleUpdateTicket}
                                        disabled={isUpdating || !status}
                                        className="w-full h-10 mt-3 mb-2 rounded-lg bg-[#6D5BD0] text-white text-sm font-medium disabled:opacity-50 hover:bg-[#5a4abf] transition-colors"
                                    >
                                        {isUpdating ? 'Updating...' : 'Update Ticket'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-10 text-center text-sm text-gray-500">
                                Select a ticket to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportTicketDetail;