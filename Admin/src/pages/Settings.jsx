import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Search, UserCheck, Check } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';

const Verifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('https://agrochain-ethiopia-server1221.onrender.com/api/admin/verifications/pending', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerifications(data.pending);
      } else {
        console.error('Failed to fetch verifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (userId, action) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`https://agrochain-ethiopia-server1221.onrender.com/api/admin/verify/${userId}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchVerifications();
        setShowActionModal(false);
        setShowDetailsModal(false);
      } else {
        console.error(`Failed to ${action} verification:`, response.status);
      }
    } catch (error) {
      console.error(`Error ${action}ing verification:`, error);
    }
  };

  const filteredVerifications = verifications.filter(
    (verification) =>
      verification.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  const onCardKeyDown = (e, verification) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedVerification(verification);
      setShowDetailsModal(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-gray-800">
      <Table
        title="Pending Verifications"
        icon={UserCheck}
        actions={[
          <div key="search" className="flex items-center gap-2">
            <Input
              placeholder="Search verifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="w-64"
              aria-label="Search verifications"
            />
          </div>,
        ]}
      >
        <div className="space-y-4">
          {filteredVerifications.map((verification) => (
            <Card
              key={verification._id}
              gradient
              className="p-6 cursor-pointer bg-white hover:shadow-md border border-gray-200"
              role="button"
              tabIndex={0}
              aria-label={`View verification details for ${verification.fullName}`}
              onClick={() => {
                setSelectedVerification(verification);
                setShowDetailsModal(true);
              }}
              onKeyDown={(e) => onCardKeyDown(e, verification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold">{verification.fullName}</h3>
                    <p className="text-gray-600 text-sm">{verification.email}</p>
                    <p className="text-gray-600 text-sm">User ID: {verification.userId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-300"
                    aria-label={`Verification status: ${verification.govIdStatus}`}
                  >
                    {verification.govIdStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVerification(verification);
                    setShowDetailsModal(true);
                  }}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2 flex-1"
                  aria-label={`View details of ${verification.fullName}`}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  View Details
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVerification(verification);
                    setActionType('approve');
                    setShowActionModal(true);
                  }}
                  variant="success"
                  size="sm"
                  className="flex items-center gap-2 flex-1"
                  aria-label={`Approve verification for ${verification.fullName}`}
                >
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  Approve
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVerification(verification);
                    setActionType('reject');
                    setShowActionModal(true);
                  }}
                  variant="danger"
                  size="sm"
                  className="flex items-center gap-2 flex-1"
                  aria-label={`Reject verification for ${verification.fullName}`}
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Table>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Verification Details"
        size="lg"
      >
        {selectedVerification && (
          <div className="space-y-6 text-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedVerification.fullName}</h3>
                <p className="text-gray-600">Email: {selectedVerification.email}</p>
                <p className="text-gray-600">User ID: {selectedVerification.userId}</p>
                <p className="text-gray-600">Status: {selectedVerification.govIdStatus}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Government ID (Front)</h4>
                <img
                  src={selectedVerification.govIdFront}
                  alt="Government ID Front"
                  className="w-full h-auto rounded-lg border border-gray-300"
                />
                <a
                  href={selectedVerification.govIdFront}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline mt-2 block"
                >
                  View Full Size
                </a>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Government ID (Back)</h4>
                <img
                  src={selectedVerification.govIdBack}
                  alt="Government ID Back"
                  className="w-full h-auto rounded-lg border border-gray-300"
                />
                <a
                  href={selectedVerification.govIdBack}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline mt-2 block"
                >
                  View Full Size
                </a>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setActionType('approve');
                  setShowActionModal(true);
                }}
                variant="success"
                className="flex-1 flex items-center gap-2"
                size="sm"
              >
                <Check className="h-4 w-4" />
                Verify
              </Button>
              <Button
                onClick={() => {
                  setActionType('reject');
                  setShowActionModal(true);
                }}
                variant="danger"
                className="flex-1"
              >
                Reject Verification
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Verification`}
        size="sm"
      >
        {selectedVerification && (
          <div className="space-y-4 text-gray-800">
            <p>
              Are you sure you want to{' '}
              <span className="font-semibold">
                {actionType === 'approve' ? 'approve' : 'reject'}
              </span>{' '}
              the verification for{' '}
              <span className="font-semibold">{selectedVerification.fullName}</span>?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleVerificationAction(selectedVerification.userId, actionType)}
                variant={actionType === 'approve' ? 'success' : 'danger'}
                className="flex-1"
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
              <Button
                onClick={() => setShowActionModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Verifications;
