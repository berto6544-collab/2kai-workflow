import React, { useState, useRef, useCallback } from 'react';



const  RenderFormField = ({field,formData,handleFieldChange,selectedNode}) => {
    const { name, label, type, placeholder, options } = field;
    const value = formData[selectedNode.id]?.[field.name] || '';

    




    switch (type) {
      case 'select':
        return (
          <div key={name} className="py-2 px-2 flex flex-col items-start gap-2">
            <label className="block text-sm font-medium text-gray-100">{label}</label>
            <select
              value={field.value}
              onChange={(e) =>{
                handleFieldChange(name, e.target.value)
                field.value = e.target.value
                
              }}
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select {label}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'keyValueList':
  return (
    <div key={name} className="py-2 px-2 flex flex-col items-start gap-2 w-full">
      <label className="block text-sm font-medium text-gray-100">{label}</label>
      {Array.isArray(value) && value.map((pair, index) => (
        <div key={index} className="flex w-full gap-2 items-center border-b border-b-1 border-gray-800 pb-4 ">
        <div className="flex flex-col w-full gap-2 items-start">
          <div className="flex w-full gap-2 justify-between">
          <p>key</p>
          
          <button
            type="button"
            onClick={() => {
              const updated = value.filter((_, i) => i !== index);
              field.arrayvalue = updated;
              handleFieldChange(name, updated);
            }}
            className="text-red-400 hover:text-red-600 px-2"
          >
            ✕
          </button>
          </div>
          <input
            type="text"
            placeholder={field.keyPlaceholder || 'Key'}
            value={pair.key || ''}
            onChange={(e) => {
              const updated = [...value];
              updated[index] = { ...updated[index], key: e.target.value };
              handleFieldChange(name, updated);
              field.arrayvalue = updated;
            }}
            className="flex-1 px-3 w-full py-2 border border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
           <p>value</p>
          <input
            type={field.valueType || 'text'}
            placeholder={field.valuePlaceholder || 'Value'}
            value={pair.value || ''}
            onChange={(e) => {
              const updated = [...value];
              updated[index] = { ...updated[index], value: e.target.value};
              handleFieldChange(name, updated);
              field.arrayvalue = updated;
            }}
            className="flex-1 px-3 py-2 w-full border border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          </div>
        
        
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const updated =  [...value, { key: '', value: '' }]
          handleFieldChange(name, updated);
          field.arrayvalue = updated;
          console.log(field)
        }}
        className="mt-2 text-sm text-blue-400 hover:underline"
      >
        + Add {field.itemLabel || 'Key-Value Pair'}
      </button>
    </div>
  );

        case 'selectBody':
        return (
          <div key={name} className="py-2 px-2 flex flex-col items-start gap-2 w-full">
          <div className="flex flex-col items-start gap-2 w-full">
            <label className="block text-sm font-medium text-gray-100">{label}</label>
            <select
              value={field.value}
              onChange={(e) =>{
                handleFieldChange(name, e.target.value)
                field.value = e.target.value
                
              }}
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select {label}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
            {
              field.value != ""?
            <div key={name} className="py-2 w-full flex flex-col items-start gap-2">
            <label className="block text-sm font-medium text-gray-100">{field.body.label}</label>
            <textarea
              value={field.body.value}
              onChange={(e) =>{
                
                handleFieldChange(field?.body.name, e.target.value)
                field.body.value = e.target.value
              }}
              placeholder={field.value == "JSON"?field.body.placeholder: field.value == "Form_Urlencoded"?'key1=value\nkey2=value':null}
              rows={4}
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>:null
            }


          </div>
        );

      case 'textarea':
        return (
          <div key={name} className="py-2 px-2 flex flex-col items-start gap-2">
            <label className="block text-sm font-medium text-gray-100">{label}</label>
            <textarea
              value={field.value}
              onChange={(e) =>{
                handleFieldChange(name, e.target.value)
                field.value = e.target.value
              }}
              placeholder={placeholder}
              rows={4}
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        );

      case 'code':
        return (
          <div key={name} className="py-2 px-2 flex flex-col items-start gap-2">
            <label className="block text-sm font-medium text-gray-100">{label}</label>
            <textarea
              value={field.value}
              onChange={(e) =>{
                handleFieldChange(name, e.target.value)
                field.value = e.target.value
              }}
              placeholder={placeholder}
              rows={8}
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
            />
          </div>
        );

      case 'number':
        return (
          <div key={name} className="py-2 px-2 flex flex-col items-start gap-2">
            <label className="block text-sm font-medium text-gray-100">{label}</label>
            <input
              type="number"
              value={field.value}
              onChange={(e) =>{
              handleFieldChange(name, e.target.value)
              field.value = e.target.value
              }}
              placeholder={placeholder}
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'time':
        return (
          <div key={name} className="py-2 px-2 flex flex-col items-start gap-2">
            <label className="block text-sm font-medium text-gray-100">{label}</label>
            <input
              type="time"
              value={field.value}
              onChange={(e) => {
                
                handleFieldChange(name, e.target.value)
                field.value = e.target.value
              }}
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return (
          <div key={name} className="py-2 px-2 flex flex-col items-start gap-2">
            <label className="block text-sm font-medium text-gray-100">{label}</label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => {
                handleFieldChange(name, e.target.value)
                field.value = e.target.value

              }}
              placeholder={placeholder}
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
    }
  };

  export default RenderFormField