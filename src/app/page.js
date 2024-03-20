"use client";
import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Home() {
  const [inputNumber, setInputNumber] = useState("");
  const [inputs, setInputs] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const handleNumberInputChange = (e) => {
    setInputNumber(e.target.value);
  };

  const addTextboxes = () => {
    setIsButtonClicked(true);
    const num = parseInt(inputNumber) || 0;
    setInputs(
      Array(num)
        .fill()
        .map(() => ({ text: "", checked: isAllChecked }))
    );
  };

  const handleInputChange = (e, index) => {
    const updatedInputs = [...inputs];
    updatedInputs[index].text = e.target.value;
    setInputs(updatedInputs);
  };

  const handleCheckboxChange = (index) => {
    const updatedInputs = [...inputs];
    updatedInputs[index].checked = !updatedInputs[index].checked;
    setInputs(updatedInputs);
    checkAllChecked(updatedInputs); 
  };

  const handleAllCheckChange = () => {
    const newCheckedState = !isAllChecked;
    setIsAllChecked(newCheckedState);
    const updatedInputs = inputs.map((input) => ({
      ...input,
      checked: newCheckedState,
    }));
    setInputs(updatedInputs);
  };

  const checkAllChecked = (inputs) => {
    const allChecked = inputs.every((input) => input.checked);
    setIsAllChecked(allChecked);
  };

  const getSelectionMessage = () => {
    const selectedCount = inputs.filter((input) => input.checked).length;

    if (selectedCount === 0) {
      return "No textboxes selected.";
    } else if (selectedCount === inputs.length) {
      return (
        <p>Selected all <span className=" font-bold"> {inputs.length} items</span></p>
        );
    } else {
      const selectedIndexes = inputs
        .map((input, index) => (input.checked ? index + 1 : null))
        .filter((index) => index !== null)
        .join(", ");
      return (<p>Selected <span className=" font-bold">{selectedCount} items</span>, there <span className=" font-bold"> position is {selectedIndexes}</span></p>);
    }
  };

  const calculateSum = () => {
    return inputs.reduce((acc, curr) => {
      if (curr.checked) {
        const value = parseFloat(curr.text) || 0;
        return acc + value;
      }
      return acc;
    }, 0);
  };
  
  useEffect(() => {
    const total = calculateSum();
    const updateTotalInFirestore = async () => {
      try {
        await addDoc(collection(db, "totals"), {
          total: total,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error updating total in Firestore:", error);
      }
    };
    if (inputs.length > 0) {
      updateTotalInFirestore();
    }
  }, [inputs]);


  return (
    <div className="flex w-full h-[100vh] items-center justify-center flex-col">
      <div className="flex gap-3">
        <div className="bg-[#FEE4CA] px-3 border text-bold border-[#C5BF86] py-1 h-fit">
          No of Textbox:
        </div>
        <div>
        <div className="flex flex-col w-40">
          <input
            type="number"
            value={inputNumber}
            onChange={handleNumberInputChange}
            className="bg-white border border-black rounded-md px-3 py-1"
          />
          <button
            onClick={addTextboxes}
            className="bg-[#0750D2] px-3 py-2 text-white rounded-md mt-2 ml-auto w-fit"
          >
            Add Textbox
          </button>
        </div>
        <div>
      {isButtonClicked && (
        <div className="flex gap-2 mt-2">
          <input
            type="checkbox"
            checked={isAllChecked}
            onChange={handleAllCheckChange}
            className=" accent-[#05898A]"
          />
          <div className="bg-[#FEE4CA] px-3 border text-bold border-[#C5BF86] py-1 h-fit">
            All Check
          </div>
        </div>
      )}
      {inputs.map((input, index) => (
        <div key={index}>
          <input
            type="checkbox"
            checked={input.checked}
            onChange={() => handleCheckboxChange(index)}
            className="mt-2 accent-[#05898A]"
          />
          <input
            type="number"
            value={input.text}
            onChange={(e) => handleInputChange(e, index)}
            placeholder={`Textbox ${index + 1}`}
            className="bg-white border border-black rounded-md px-3 py-1 w-40 ml-2 mt-2"
          />
        </div>
      ))}
      </div>
        </div>
      </div>
     <div className="flex gap-3 mt-4 items-center">
      <p>Output is: </p>
      <div className="bg-[#E1D5E5] p-2 border border-[#AE9FAC]">
        {getSelectionMessage()} and total number is <span className="font-bold">{calculateSum()}</span>
      </div>
      </div>
    </div>
  );
}
