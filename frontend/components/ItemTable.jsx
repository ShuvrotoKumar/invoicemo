"use client";

import React from 'react';
import { Form, Input, InputNumber, Button, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const ItemTable = () => {
  return (
    <Card title="Invoice Items" className="shadow-sm rounded-xl mt-6 bg-white dark:bg-gray-800">
      <Form.List name="items" initialValue={[{ name: '', description: '', quantity: 1, unitPrice: 0 }]}>
        {(fields, { add, remove }) => (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">Item Name</th>
                    <th className="py-3 px-2 font-semibold text-gray-600 dark:text-gray-300 text-sm">Description</th>
                    <th className="py-3 px-2 font-semibold text-gray-600 dark:text-gray-300 text-sm w-24">Qty</th>
                    <th className="py-3 px-2 font-semibold text-gray-600 dark:text-gray-300 text-sm w-32">Unit Price</th>
                    <th className="py-3 px-2 font-semibold text-gray-600 dark:text-gray-300 text-sm w-28 text-right">Total</th>
                    <th className="py-3 px-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(({ key, name, ...restField }) => (
                    <tr key={key} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="py-3 px-2 align-top">
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          rules={[{ required: true, message: 'Missing item name' }]}
                          noStyle
                        >
                          <Input placeholder="Item name" className="border-0 shadow-none focus:ring-0 bg-transparent px-1" />
                        </Form.Item>
                      </td>
                      <td className="py-3 px-2 align-top">
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          noStyle
                        >
                          <Input placeholder="Description" className="border-0 shadow-none focus:ring-0 bg-transparent px-1" />
                        </Form.Item>
                      </td>
                      <td className="py-3 px-2 align-top">
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          rules={[{ required: true, message: 'Qty' }]}
                          noStyle
                        >
                          <InputNumber min={1} placeholder="1" className="w-full border-0 shadow-none focus:ring-0 bg-transparent px-1" />
                        </Form.Item>
                      </td>
                      <td className="py-3 px-2 align-top">
                        <Form.Item
                          {...restField}
                          name={[name, 'unitPrice']}
                          rules={[{ required: true, message: 'Price' }]}
                          noStyle
                        >
                          <InputNumber
                            min={0}
                            placeholder="0.00"
                            className="w-full border-0 shadow-none focus:ring-0 bg-transparent px-1"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/,/g, '')}
                          />
                        </Form.Item>
                      </td>
                      <td className="py-3 px-2 align-top text-right">
                        <Form.Item
                          shouldUpdate={(prevValues, curValues) =>
                            prevValues.items?.[name]?.quantity !== curValues.items?.[name]?.quantity ||
                            prevValues.items?.[name]?.unitPrice !== curValues.items?.[name]?.unitPrice
                          }
                          noStyle
                        >
                          {({ getFieldValue }) => {
                            const quantity = getFieldValue(['items', name, 'quantity']) || 0;
                            const unitPrice = getFieldValue(['items', name, 'unitPrice']) || 0;
                            return <span className="font-semibold text-gray-700 dark:text-gray-300">{(quantity * unitPrice).toFixed(2)}</span>;
                          }}
                        </Form.Item>
                      </td>
                      <td className="py-3 px-2 align-top text-center">
                        <DeleteOutlined
                          className="text-red-400 cursor-pointer hover:text-red-600 transition-colors"
                          onClick={() => remove(name)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Form.Item className="mt-4 mb-0">
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className="rounded-lg h-10 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                Add Item
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  );
};

export default ItemTable;
