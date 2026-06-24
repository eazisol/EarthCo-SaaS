import React, { useState } from 'react'

const TextArea = ({placeholder, value, name, onChange, disabled = false, className = "" }) => {
    const [textareaHeight, setTextareaHeight] = useState('3em'); 

 

    const handleResize = (event) => {
      const { target } = event;
      target.style.height = 'auto'; 
      target.style.height = `${target.scrollHeight}px`; 
      setTextareaHeight(`${target.scrollHeight}px`); 
    };
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      name={name}
      onChange={onChange}
      onInput={handleResize}
      disabled={disabled}
      style={{ height: textareaHeight, minHeight : "6em" }}
      className={`form-control textarea-resizable ${className}`}
      rows="3"
    ></textarea>
  )
}

export default TextArea