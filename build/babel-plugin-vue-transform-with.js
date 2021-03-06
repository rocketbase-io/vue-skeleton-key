import * as t from "@babel/types";

export default () => {
  function shouldSimpleReplace(it) {
    const name = it.node.name;
    if (t.isAssignmentExpression(it.parent) && it.key === "left") return true;
    return /^[$_]/g.test(name) && !["$event", "$$v"].includes(name);
  }

  function isRecursiveCall(path, parent, withName) {
    if (t.isMemberExpression(parent)) return true;
    if (
      t.isConditionalExpression(path.parentPath) &&
      t.isMemberExpression(path.parentPath.get("alternate")) &&
      path.parentPath.get("alternate.object").node === withName
    )
      return true;
    return (
      t.isConditionalExpression(path.parentPath.parentPath.parentPath) &&
      t.isMemberExpression(path.parentPath.parentPath.parentPath.get("alternate")) &&
      path.parentPath.parentPath.parentPath.get("alternate.object").node === withName
    );
  }

  function isVariableDeclaration(path, parent) {
    if (t.isVariableDeclarator(parent) || t.isObjectPattern(parent.parentPath) || t.isArrayPattern(parent.parentPath)) return true;
    return t.isFunction(parent) && path.parent.params.includes(path.node);
  }

  function shouldProcess(path, parent, withName, withExpr) {
    if (isRecursiveCall(path, parent, withName)) return false;
    if (isVariableDeclaration(path, parent)) return false;
    if (["key", "id", "params"].includes(path.key)) return false;
    return !(path.node === withName || path.node === withExpr);
  }

  function buildTestExpression(withIdentifier, otherIdentifier) {
    let test = t.binaryExpression("!==", t.unaryExpression("typeof", otherIdentifier), t.stringLiteral("undefined"));
    return t.parenthesizedExpression(t.conditionalExpression(test, otherIdentifier, t.memberExpression(withIdentifier, otherIdentifier)));
  }

  return {
    name: "babel-plugin-vue-transform-with",
    visitor: {
      WithStatement(withPath) {
        const withExpr = withPath.get("object").node;
        const content = withPath.get("body.body");
        const withName = t.identifier("_with");
        withPath.insertBefore(t.variableDeclaration("const", [t.variableDeclarator(withName, withExpr)]));
        withPath.get("body").traverse({
          Identifier(path) {
            const parent = path.parentPath;
            if (!shouldProcess(path, parent, withName, withExpr)) return;
            if (shouldSimpleReplace(path)) path.replaceWith(t.memberExpression(withName, path.node));
            else path.replaceWith(buildTestExpression(withName, path.node));
          },
          MemberExpression(path) {
            let objectPath = path.get("object");
            if (!t.isIdentifier(objectPath)) return;
            if (path.get("object").node === withName) return;
            if (shouldSimpleReplace(objectPath)) path.replaceWith(t.memberExpression(withName, objectPath.node));
            else objectPath.replaceWith(buildTestExpression(withName, objectPath.node));
          }
        });
        withPath.replaceWithMultiple(content.map(path => path.node));
      }
    }
  };
};
