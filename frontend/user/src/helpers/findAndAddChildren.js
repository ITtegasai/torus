export const findAndAddChildren = (nodes, targetLevel, targetIndex, newChildren, currentLevel = 0) => {
    // Делаем копию текущего массива узлов, чтобы не мутировать оригинальные данные
    const updatedNodes = nodes.map(node => ({ ...node }));
  
    // Если достигли нужного уровня вложенности
    if (currentLevel === targetLevel) {
      // Добавляем новых детей к нужному элементу
      updatedNodes[targetIndex].children = [...updatedNodes[targetIndex]?.children, ...newChildren];
      return updatedNodes;
    }
  
    // Идем глубже, если не на нужном уровне
    updatedNodes.forEach((node, index) => {
      if (node.children && node.children.length > 0) {
        updatedNodes[index].children = findAndAddChildren(
          node.children, 
          targetLevel, 
          targetIndex, 
          newChildren, 
          currentLevel + 1
        );
      }
    });
  
    return updatedNodes;
  };
  