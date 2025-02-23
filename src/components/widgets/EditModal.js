"use client";

import {AlertCircle, ChevronDown, Plus, Save, X} from 'lucide-react';
// import PatternBackground from './components/PatternBackground';

export default function EditModal({
  show,
  onClose,
  onSave,
  modalTitle,
  fields,
  data,
  onChange,
  disableSave = false,
  showDoneButton = false,
  onFileChange,
  isClientCheckList = false,
  addClickCheckList,
  handleItemNameChange,
  handleRemoveItemName,
  extraTemplateData,
  errMsgs,
  filteredStates,
  setFilteredStates,
  filteredSuburbs,
  setFilteredSuburbs,
  btnName,
  btnIcon
}) {
  if (!show) return null;

  const renderFields = () => {
    const rows = [];
    for (let i = 0; i < fields?.length; i += 3) {
      rows.push(
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* First Field */}
          {fields[i] && (
            <div>
              {fields[i].type === "checkbox" ? (
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    id={fields[i].id}
                    checked={fields[i].value == "N" ? false : true}
                    // checked={true}
                    onChange={(e) => onChange({ id: fields[i].id, value: e.target.checked ? "Y" : "N" })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{fields[i].label}</span>
                </label>
              ) : (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {fields[i].label}
                  </label>
                  {fields[i].type === "select" ? (
                    <div className="relative">
                      <select
                        id={fields[i].id}
                        value={data[fields[i].id] || ""}
                        onChange={(e) => onChange({ id: fields[i].id, value: e.target.value ? "Y" : "N" })}
                        disabled={fields[i].disabled}
                        className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                      >
                        <option value="">Select {fields[i].label}</option>
                        {fields[i].options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type={fields[i].type || "text"}
                      id={fields[i].id}
                      value={data[fields[i].id] || ""}
                      onChange={(e) => onChange({ id: fields[i].id, value: e.target.value })}
                      disabled={fields[i].disabled}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      onKeyDown={
                        fields[i].type === "number"
                          ? (event) => {
                            if (
                              !/[0-9]/.test(event.key) &&
                              !["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "Enter"].includes(event.key)
                            ) {
                              event.preventDefault();
                            }
                          }
                          : undefined
                      }
                    />
                  )}

                  {/* State/Suburb Suggestions */}
                  {((fields[i].id === "State" || fields[i].id === "state") && filteredStates?.length > 0) && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg max-h-48 overflow-auto">
                      {filteredStates.map((state, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            onChange({ id: fields[i].id, value: state });
                            setFilteredStates([]);
                          }}
                          className="px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                        >
                          {state}
                        </li>
                      ))}
                    </ul>
                  )}

                  {((fields[i].id === "Suburb" || fields[i].id === "suburb") && filteredSuburbs?.length > 0) && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg max-h-48 overflow-auto">
                      {filteredSuburbs.map((suburb, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            onChange({ id: fields[i].id, value: suburb });
                            setFilteredSuburbs([]);
                          }}
                          className="px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                        >
                          {suburb}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Error Messages */}
                  {errMsgs?.[fields[i].id] && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errMsgs[fields[i].id]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Second Field */}
          {fields[i + 1] && (
            <div>
              {fields[i + 1].type === "checkbox" ? (
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    id={fields[i + 1].id}
                    checked={fields[i + 1].value == "N" ? false : true}
                    // checked={false}
                    onChange={(e) => onChange({ id: fields[i + 1].id, value: e.target.checked ? "Y" : "N" })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{fields[i + 1].label}</span>
                </label>
              ) : (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {fields[i + 1].label}
                  </label>
                  {fields[i + 1].type === "select" ? (
                    <div className="relative">
                      <select
                        id={fields[i + 1].id}
                        value={data[fields[i + 1].id] || ""}
                        onChange={(e) => onChange({ id: fields[i + 1].id, value: e.target.value })}
                        disabled={fields[i + 1].disabled}
                        className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                      >
                        <option value="">Select {fields[i + 1].label}</option>
                        {fields[i + 1].options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type={fields[i + 1].type || "text"}
                      id={fields[i + 1].id}
                      value={data[fields[i + 1].id] || ""}
                      onChange={(e) => onChange({ id: fields[i + 1].id, value: e.target.value })}
                      disabled={fields[i + 1].disabled}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  )}
                  {errMsgs?.[fields[i + 1].id] && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errMsgs[fields[i + 1].id]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Third Field */}
          {fields[i + 2] && (
            <div>
              {fields[i + 2].type === "checkbox" ? (
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    id={fields[i + 2].id}
                    checked={data[fields[i + 2].id] || "N"}
                    onChange={(e) => onChange({ id: fields[i + 2].id, value: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{fields[i + 2].label}</span>
                </label>
              ) : (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {fields[i + 2].label}
                  </label>
                  {fields[i + 2].type === "select" ? (
                    <div className="relative">
                      <select
                        id={fields[i + 2].id}
                        value={data[fields[i + 2].id] || ""}
                        onChange={(e) => onChange({ id: fields[i + 2].id, value: e.target.value })}
                        disabled={fields[i + 2].disabled}
                        className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                      >
                        <option value="">Select {fields[i + 2].label}</option>
                        {fields[i + 2].options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type={fields[i + 2].type || "text"}
                      id={fields[i + 2].id}
                      value={data[fields[i + 2].id] || ""}
                      onChange={(e) => onChange({ id: fields[i + 2].id, value: e.target.value })}
                      disabled={fields[i + 2].disabled}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  )}
                  {errMsgs?.[fields[i + 2].id] && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errMsgs[fields[i + 2].id]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl mx-4 glass dark:glass-dark rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {modalTitle}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
            {renderFields()}

            {/* Extra Template Data */}
            {extraTemplateData?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {extraTemplateData.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            {/* Item Names */}
            {data?.ItemName?.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Item Name {index + 1}
                  </label>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemNameChange(index, e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <button
                  onClick={() => handleRemoveItemName(index)}
                  className="mt-6 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            {showDoneButton ? (
              <button
                onClick={onSave}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            ) : (
              <>
                {isClientCheckList && (
                  <button
                    onClick={addClickCheckList}
                    disabled={disableSave}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={onSave}
                  disabled={Object.keys(errMsgs || {}).length > 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {btnIcon || <Save className="h-4 w-4" />}
                  <span>{btnName || "Save Changes"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}