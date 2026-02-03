import { Check } from 'lucide-react';
import { Button } from '../ui/button';

export const TermsModal = ({
  showTermsModal,
  setShowTermsModal,
  setAcceptedTerms,
}) => {
  if (!showTermsModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">
              Terms and Conditions & Privacy Policy
            </h3>
            <button
              onClick={() => setShowTermsModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6 text-gray-700">
            <section>
              <h4 className="text-lg font-semibold mb-3 text-gray-900">
                Hospital Management System Terms and Conditions
              </h4>
              <p className="mb-4">
                By creating an account with St. Jude's Medical Hospital
                Management System, you acknowledge and agree to the following
                terms:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  <strong>Medical Record Access:</strong> You understand that
                  authorized healthcare providers including doctors, nurses, and
                  medical staff involved in your care will have access to your
                  medical records, treatment plans, test results, and health
                  information as necessary for providing medical services.
                </li>
                <li>
                  <strong>Data Privacy:</strong> Your personal and medical
                  information will be handled in accordance with the Data
                  Privacy Act of 2012 (RA 10173) and other applicable healthcare
                  regulations.
                </li>
                <li>
                  <strong>Emergency Access:</strong> In emergency situations,
                  medical personnel may access your medical information without
                  explicit consent to ensure timely and appropriate medical
                  intervention.
                </li>
                <li>
                  <strong>Appointment Management:</strong> The system will
                  manage your appointments, medical consultations, and treatment
                  schedules.
                </li>
                <li>
                  <strong>Communication Consent:</strong> You consent to receive
                  medical communications, appointment reminders, and health
                  updates via email and SMS.
                </li>
                <li>
                  <strong>Information Accuracy:</strong> You are responsible for
                  providing accurate and complete personal and medical
                  information.
                </li>
                <li>
                  <strong>Account Security:</strong> You must maintain the
                  confidentiality of your login credentials and immediately
                  report any unauthorized access.
                </li>
              </ul>
            </section>

            <section>
              <h4 className="text-lg font-semibold mb-3 text-gray-900">
                Patient Rights and Responsibilities
              </h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>You have the right to access your medical records</li>
                <li>You may request corrections to inaccurate information</li>
                <li>
                  You can inquire about who has accessed your medical
                  information
                </li>
                <li>
                  You are responsible for updating your contact information
                </li>
                <li>
                  You must notify the hospital of any changes in your health
                  status
                </li>
              </ul>
            </section>

            <section>
              <h4 className="text-lg font-semibold mb-3 text-gray-900">
                Healthcare Provider Access Policy
              </h4>
              <p className="mb-2">
                Medical professionals accessing your records are bound by:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Doctor-Patient Confidentiality obligations</li>
                <li>Professional ethical standards</li>
                <li>Legal requirements for medical record keeping</li>
                <li>Need-to-know basis access control</li>
                <li>Audit trail requirements for all access</li>
              </ul>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This system facilitates coordination
                between healthcare providers to ensure comprehensive and
                continuous care. Your medical team may include multiple
                specialists who require access to your complete medical history
                for optimal treatment planning.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowTermsModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setAcceptedTerms(true);
                setShowTermsModal(false);
              }}
              icon={Check}
            >
              Accept Terms
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
