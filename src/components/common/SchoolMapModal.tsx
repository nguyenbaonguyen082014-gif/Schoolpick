import React from 'react';
import { X, Navigation, Compass } from 'lucide-react';
import { PickupZoneId } from '../../types';
import { CampusPickupMap } from '../map/CampusPickupMap';

interface SchoolMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightZoneId?: PickupZoneId;
}

export const SchoolMapModal: React.FC<SchoolMapModalProps> = ({
  isOpen,
  onClose,
  highlightZoneId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="school-map-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="school-map-modal-content"
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                SƠ ĐỒ PHÂN LUỒNG & BẢN ĐỒ KHU VỰC ĐÓN
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Trường THCS Ban Mai • 4 phân khu đón A, B, C, D
              </p>
            </div>
          </div>
          <button
            id="btn-close-map-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Interactive Map */}
        <div className="p-3 sm:p-5 flex-1">
          <CampusPickupMap
            highlightZoneId={highlightZoneId}
            compact={false}
            showLegend={true}
            showInstructions={true}
            interactive={true}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            💡 Nhấp trực tiếp vào từng khu vực để xem thông tin lớp và trạng thái giao thông
          </span>
          <button
            id="btn-confirm-map-modal"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition-colors cursor-pointer ml-auto"
          >
            Đóng sơ đồ
          </button>
        </div>
      </div>
    </div>
  );
};
