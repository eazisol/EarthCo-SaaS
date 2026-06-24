import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Delete } from '@mui/icons-material';
import { Button } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import formatAmount from '../../custom/FormatAmount';

const ItemType = 'ROW';

const DraggableRow = ({
  item,
  index,
  moveRow,
  handleDescriptionChange,
  handleQuantityChange,
  handleRateChange,
  handleCostChange,
  handleIsApproved,
  deleteItem,
}) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover(draggedItem) {
      setTimeout(() => {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }, 10);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { type: ItemType, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <tr ref={ref} style={{ opacity: isDragging ? 0.5 : 1 ,cursor: 'pointer'}} key={index}>
      <td style={{ width: '2em',  }}>
        <DragIndicatorIcon />
      </td>
      <td>{item.Name}</td>
      <td>
        <textarea
          size="small"
          rows="2"
          style={{ height: 'fit-content' ,width : "23em"}}
          className="form-control form-control-sm"
          value={item.Description}
          onChange={(e) => handleDescriptionChange(index, e, 0)}
        />
      </td>
      <td>
        <input
         
          className="form-control form-control-sm number-input"
          value={item.Qty}
          onChange={(e) => handleQuantityChange(index, e, 0)}
        />
      </td>
      <td>
        <input
        
          className="form-control form-control-sm number-input"
          value={item.Rate}
          onChange={(e) => handleRateChange(index, e, 0)}
        />
      </td>
      <td className="text-right pe-2">
        {item ? formatAmount(item.Qty * item.Rate) : 0}
      </td>
      <td>
        <input
         
          className="form-control form-control-sm number-input"
          value={item.PurchasePrice}
          onChange={(e) => handleCostChange(index, e, 0)}
        />
      </td>
      <td className="text-center">
        <Checkbox
          value={item.IsApproved}
          checked={item.IsApproved}
          onChange={(e) => handleIsApproved(index, e, 0)}
        />
      </td>
      <td>
     
        <div className="badgeBox">
          <Button onClick={() => deleteItem(index, item.isCost)}>
            <Delete color="error" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default DraggableRow;
