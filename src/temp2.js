"use client";

import {useState} from 'react';
import {Bell, Building2, ChevronDown, Copy, CreditCard, Heart, Info, Minus, Plus} from 'lucide-react';

export default function AccountDetails({
  addValidationMessage,
  setSelectedComponent,
  onTabChange,
  onSaveReady,
  isButtonClicked,
  setIsButtonClicked,
  detailsForm,
  handleChange,
  disableSection,
  errors,
  billingPreference,
  exemption,
  needsIndicator,
  primaryDisability,
  secondaryDisability,
  mobilityLevel,
  dementiaAndCognitiveImpairment,
  filteredStates,
  setFilteredStates,
  filteredSuburbs,
  setFilteredSuburbs,
  emailError,
  phoneError,
  phone2Error
}) {
  const [sections, setSections] = useState({
    billing: true,
    finance: true,
    health: true,
    alerts: true
  });

  const cardTypes = [
    "Visa",
    "MasterCard",
    "American Express (AmEx)",
    "UnionPay",
    "EFTPOS",
    "Discover",
    "Maestro",
    "JCB"
  ];

  const SectionHeader = ({ icon: Icon, title, expanded, onToggle, required }) => (
    <div 
      onClick={onToggle}
      className="flex items-center justify-between p-4 glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 cursor-pointer group hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors">
          <Icon className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
          }
        </h3>
      </div>
      {expanded ? (
        <Minus className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
      ) : (
        <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
      )}
    </div>
  );

  const FormField = ({ label, id, type = "text", value, error, options, disabled = false, className = "", placeholder = "", onKeyDown }) => (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {type === "select" ? (
        <div className="relative">
          <select
            id={id}
            value={value || ""}
            onChange={handleChange}
            disabled={disabled || disableSection}
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none disabled:opacity-50"
          >
            <option value="">Select {label}</option>
            {options?.map((opt, idx) => {
              const optionValue = typeof opt === 'object' ? opt.value : opt;
              const optionLabel = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={idx} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled || disableSection}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 min-h-[100px]"
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled || disableSection}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          className="w-full px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
        />
      )}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <Info className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );

  const Checkbox = ({ id, label, checked, disabled }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        name="checkbox"
        checked={checked || false}
        onChange={handleChange}
        disabled={disabled || disableSection}
        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/30"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Billing Details Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Building2}
          title="Billing Details"
          expanded={sections.billing}
          onToggle={() => setSections(prev => ({ ...prev, billing: !prev.billing }))}
          required
        />
        
        {sections.billing && (
          <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                label="Billing Preference"
                id="billingPreference"
                type="select"
                value={detailsForm.billingPreference}
                options={billingPreference.map(item => ({
                  label: item.ParamDesc,
                  value: item.ParamValue
                }))}
              />

              <FormField
                label="Name"
                id="billingName"
                value={detailsForm.billingName}
              />

              <FormField
                label="Address Line 1"
                id="billingAddressLine1"
                value={detailsForm.billingAddressLine1}
              />

              <FormField
                label="Address Line 2"
                id="billingAddressLine2"
                value={detailsForm.billingAddressLine2}
              />

              <FormField
                label="Suburb"
                id="billingSuburb"
                value={detailsForm.billingSuburb}
              />

              <FormField
                label="State"
                id="billingState"
                value={detailsForm.billingState}
              />

              <FormField
                label="Postcode"
                id="billingPostCode"
                type="number"
                value={detailsForm.billingPostCode}
                error={errors?.billingPostCode}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault();
                  }
                }}
              />

              <FormField
                label="Email"
                id="billingEmail"
                type="email"
                value={detailsForm.billingEmail}
                error={emailError}
              />

              <FormField
                label="Phone 1"
                id="billingPhone1"
                type="tel"
                value={detailsForm.billingPhone1}
                error={phoneError}
              />

              <FormField
                label="Phone 2"
                id="billingPhone2"
                type="tel"
                value={detailsForm.billingPhone2}
                error={phone2Error}
              />
            </div>
          </div>
        )}
      </div>

      {/* Finance Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={CreditCard}
          title="Finance - Credit Card"
          expanded={sections.finance}
          onToggle={() => setSections(prev => ({ ...prev, finance: !prev.finance }))}
        />
        
        {sections.finance && (
          <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Card Number"
                id="creditCardNumber"
                type="number"
                value={detailsForm.creditCardNumber}
                error={errors?.creditCardNumber}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault();
                  }
                }}
              />

              <FormField
                label="Expiry Date"
                id="creditExpiryDate"
                placeholder="MM/YYYY"
                value={detailsForm.creditExpiryDate}
                error={errors?.creditExpiryDate}
              />

              <FormField
                label="Card Type"
                id="creditCardType"
                type="select"
                value={detailsForm.creditCardType}
                options={cardTypes}
                error={errors?.creditCardType}
              />

              <FormField
                label="Name on Card"
                id="creditCardName"
                value={detailsForm.creditCardName}
                error={errors?.creditCardName}
              />
            </div>
          </div>
        )}
      </div>

      {/* Health Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Heart}
          title="Health Information"
          expanded={sections.health}
          onToggle={() => setSections(prev => ({ ...prev, health: !prev.health }))}
        />
        
        {sections.health && (
          <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="space-y-6">
              {/* COVID Information */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Checkbox
                  id="covidVaccine1"
                  label="COVID Vaccine 1"
                  checked={detailsForm.covidVaccine1}
                />
                <Checkbox
                  id="covidVaccine2"
                  label="COVID Vaccine 2"
                  checked={detailsForm.covidVaccine2}
                />
                <FormField
                  label="Booster Vaccine"
                  id="boosterVaccine"
                  type="number"
                  value={detailsForm.boosterVaccine}
                />
                <FormField
                  label="COVID Exemption"
                  id="covidExemption"
                  type="select"
                  value={detailsForm.covidExemption}
                  options={exemption.map(item => ({
                    label: item.ParamDesc,
                    value: item.ParamValue
                  }))}
                />
              </div>

              {/* Isolation Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Checkbox
                  id="inIsolation"
                  label="In Isolation"
                  checked={detailsForm.inIsolation}
                />
                <FormField
                  label="Isolation Start"
                  id="isolationStartDate"
                  type="date"
                  value={detailsForm.isolationStartDate}
                />
                <FormField
                  label="Isolation End"
                  id="isolationEndDate"
                  type="date"
                  value={detailsForm.isolationEndDate}
                />
              </div>

              {/* Physical Measurements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Weight (kg)"
                  id="weight"
                  type="number"
                  value={detailsForm.weight}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                />
                <FormField
                  label="Height (cm)"
                  id="height"
                  type="number"
                  value={detailsForm.height}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                />
              </div>

              {/* Disability Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Primary Disability"
                  id="primaryDisablity"
                  type="select"
                  value={detailsForm.primaryDisablity}
                  options={primaryDisability.map(item => ({
                    label: item.ParamDesc,
                    value: item.ParamValue
                  }))}
                />
                <FormField
                  label="Secondary Disability"
                  id="secondaryDisablity"
                  type="select"
                  value={detailsForm.secondaryDisablity}
                  options={secondaryDisability.map(item => ({
                    label: item.ParamDesc,
                    value: item.ParamValue
                  }))}
                />
                <FormField
                  label="Mobility Level"
                  id="mobilityLevel"
                  type="select"
                  value={detailsForm.mobilityLevel}
                  options={mobilityLevel.map(item => ({
                    label: item.ParamDesc,
                    value: item.ParamValue
                  }))}
                />
              </div>

              {/* Health Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Checkbox
                  id="complexNeeds"
                  label="Complex Needs"
                  checked={detailsForm.complexNeeds}
                />
                <Checkbox
                  id="visionImpaired"
                  label="Vision Impaired"
                  checked={detailsForm.visionImpaired}
                />
                <Checkbox
                  id="hearingImpaired"
                  label="Hearing Impaired"
                  checked={detailsForm.hearingImpaired}
                />
                <Checkbox
                  id="speechImpaired"
                  label="Speech Impaired"
                  checked={detailsForm.speechImpaired}
                />
                <Checkbox
                  id="manualHandlingRequired"
                  label="Manual Handling Required"
                  checked={detailsForm.manualHandlingRequired}
                />
              </div>

              {/* Additional Health Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Medication Details"
                  id="medication"
                  type="textarea"
                  value={detailsForm.medication}
                />
                <FormField
                  label="Other Health Information"
                  id="otherRelevantHealthInformation"
                  type="textarea"
                  value={detailsForm.otherRelevantHealthInformation}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alerts Section */}
      <div className="space-y-4">
        <SectionHeader
          icon={Bell}
          title="Alerts"
          expanded={sections.alerts}
          onToggle={() => setSections(prev => ({ ...prev, alerts: !prev.alerts }))}
        />
        
        {sections.alerts && (
          <div className="glass dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Checkbox
                    id="popupInProfile"
                    label="Popup in profile"
                    checked={detailsForm.popupInProfile}
                  />
                  <FormField
                    label="Alert Note"
                    id="alertNote"
                    type="textarea"
                    value={detailsForm.alertNote}
                    placeholder="Alert in profile"
                  />
                </div>

                <div className="space-y-4">
                  <Checkbox
                    id="popupInRoster"
                    label="Popup in roster"
                    checked={detailsForm.popupInRoster}
                  />
                  <FormField
                    label="Roster Note"
                    id="rosterNote"
                    type="textarea"
                    value={detailsForm.rosterNote}
                    placeholder="Alert in roster"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setDetailsForm(prev => ({
                    ...prev,
                    rosterNote: prev.alertNote
                  }));
                }}
                disabled={disableSection}
                className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Alert Note to Roster Note</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}