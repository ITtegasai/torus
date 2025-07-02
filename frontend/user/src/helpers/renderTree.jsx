import React from "react";



const Tree = () => {
  const nodes = [
    {
      name: "Taylor Fox",
      x: 300,
      y: 50,
      children: [
        {
          name: "Taylor Fox",
          children: [
            { name: "Taylor Fox11", children: [] },
            { name: "Taylor Fox2", children: [] },
            { name: "Taylor Fox3", children: [] },
            { name: "Taylor Fox54", children: [
                {
                  name: "Taylor Fox",
                  children: [
                    { name: "Taylor Fox11", children: [] },
                    { name: "Taylor Fox2", children: [] },
                    { name: "Taylor Fox3", children: [] },
                    { name: "Taylor Fox54", children: [] },
                    { name: "Taylor Fox5", children: [] },
                    { name: "Taylor Fox6", children: [] },
                    { name: "Taylor Fox7", children: [] },
                    { name: "Taylor Fox8", children: [] },
                    { name: "Taylor Fox9", children: [
                        {
                          name: "Taylor Fox",
                          children: [
                            { name: "Taylor Fox11", children: [] },
                            { name: "Taylor Fox2", children: [] },
                            { name: "Taylor Fox3", children: [] },
                            { name: "Taylor Fox54", children: [] },
                            { name: "Taylor Fox5", children: [] },
                            { name: "Taylor Fox6", children: [] },
                            { name: "Taylor Fox7", children: [] },
                            { name: "Taylor Fox8", children: [] },
                            { name: "Taylor Fox9", children: [] },
                          ],
                        },
                        { name: "Taylor Fox11111", children: [] },
                        { name: "Taylor Fox22222", children: [] },
                      ], },
                  ],
                },
                { name: "Taylor Fox11111", children: [] },
                { name: "Taylor Fox22222", children: [] },
              ], },
            { name: "Taylor Fox5", children: [] },
            { name: "Taylor Fox6", children: [] },
            { name: "Taylor Fox7", children: [] },
            { name: "Taylor Fox8", children: [] },
            { name: "Taylor Fox9", children: [] },
          ],
        },
        { name: "Taylor Fox11111", children: [] },
        { name: "Taylor Fox22222", children: [] },
      ],
    },
  ];

  const leftPadding = 50;

  return nodes.map((node, index) => (
          <Node key={index} {...{ ...node, x: node.x + leftPadding }} />
        ))

};

export default Tree;





