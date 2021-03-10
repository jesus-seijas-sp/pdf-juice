const pdf = require('pdfjs-dist/es5/build/pdf');
const PageVisitor = require('./page-visitor');

const fnIdGroup = 100;

class PdfExtract {
  constructor(config) {
    this.config = config;
    this.buildOperatorMapping();
  }

  buildOperatorMapping() {
    this.operatorMapping = {};
    const keys = Object.keys(pdf.OPS);
    for (let i = 0; i < keys.length; i += 1) {
      this.operatorMapping[pdf.OPS[keys[i]]] = keys[i];
    }
  }

  async loadDependencies(data, operators) {
    const result = [];
    for (let i = 0; i < operators.length; i += 1) {
      const current = operators[i];
      if (current.fnId === pdf.OPS.dependency) {
        /* eslint-disable no-await-in-loop */
        for (let j = 0; j < current.args; j += 1) {
          const arg = current.args[j];
          const objs = arg.startsWith('g_') ? data.commonObjs : data.objs;
          const obj = await objs.get(arg);
          result.push(obj);
        }
      }
    }
    return result;
  }

  async getOpList(pageData) {
    const operators = await pageData.getOperatorList();
    const { fnArray, argsArray } = operators;
    const result = [];
    for (let i = 0; i < fnArray.length; i += 1) {
      const fnId = fnArray[i];
      result.push({
        fnId,
        fn: this.operatorMapping[fnId],
        args: argsArray[i],
      });
    }
    return result;
  }

  opListToTree(ops) {
    let tree = [];
    const tmp = [];
    for (let i = 0; i < ops.length; i += 1) {
      const op = ops[i];
      if (op.fn === 'save') {
        tree.push({ fnId: fnIdGroup, fn: 'group', items: [] });
        tmp.push(tree);
        tree = tree[tree.length - 1].items;
      } else if (op.fn === 'restore') {
        tree = tmp.pop();
      } else {
        tree.push(op);
      }
    }
    return tree;
  }

  async extractPage(pageData) {
    const operators = await this.getOpList(pageData);
    const dependencies = await this.loadDependencies(pageData, operators);
    const opTree = this.opListToTree(operators);
    const visitor = new PageVisitor(this.config, pageData, dependencies);
    this.executeOpTree(opTree, visitor);
    return visitor.page;
  }

  async extract() {
    const result = { pages: [] };
    const doc = await pdf.getDocument({
      data: this.config.data,
      password: this.config.password,
    }).promise;
    result.metadata = await doc.getMetadata();
    result.numPages = doc.numPages;
    result.doc = doc;
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
      const data = await doc.getPage(pageNum);
      const page = await this.extractPage(data);
      const pageInfo = {
        data,
        page,
        pageNum,
      };
      result.pages.push(pageInfo);
    }
    return result;
  }

  executeOpTree(opTree, visitor) {
    for (let i = 0; i < opTree.length; i += 1) {
      const opTreeElement = opTree[i];
      const { fn, fnId, args } = opTreeElement;
      if (fnId === fnIdGroup) {
        this.executeOpTree(opTreeElement.items, visitor);
      } else {
        visitor.visit(fn, args, visitor);
      }
    }
  }
}

module.exports = PdfExtract;
