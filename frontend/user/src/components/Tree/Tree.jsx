import React, { memo } from "react";
import Node from "../TreeNode/TreeNode";
import { useState } from "react";

const Tree = ({ nodes, handleAddChild, handleClick }) => {
  const leftPadding = 50;


  return nodes.map((node, index) => (
    <>
      <Node
        node={node}
        key={index}
        y={node.y}
        image={node.image}
        name={node.name}
        x={node.x + leftPadding}
        children={node.children}
        handleAddChild={handleAddChild}
        my_structure={"{1}"}
        handleClick={handleClick}
      />
    </>
  ));
};

export default memo(Tree);
