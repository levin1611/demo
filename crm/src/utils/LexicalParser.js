// 检查编码是否正确，暂时不用，已经更换成hooks
export const LexicalParser = {
    rOperand: /^\d+$/,
    parse: function(code) {
        let m = '';
        let lexical = '';
        const arRslt = [{
            type: '^',
            value: '',
            index: 0
        }];

        if (this.hasChineseInpunt(code)) {
            throw new Error('存在中文字符！');
        }
        let token = '';
        let index = '';
        const rLexical = /\d+|and|or|\(|\)|（|）|\S+/g;
        do {
            console.log(m);
            m = rLexical.exec(code);
            if (m) {
                token = m[0];
                index = m.index;
                lexical = {
                    value: token,
                    index: index
                };
                // console.log(index, token);
                if (token == 'and') {
                    lexical.type = 'operator';
                } else if (token == 'or') {
                    lexical.type = 'operator';
                } else if (token == '(' || token == '（') {
                    lexical.type = 'limit_start';
                } else if (token == ')' || token == '）') {
                    lexical.type = 'limit_end';
                } else if (this.rOperand.test(token)) {
                    if (this.operands && this.operands.length && !~this.operands.indexOf(token)) {
                        throw new Error('存在错误的编号！');
                    }
                    lexical.type = 'operand';
                } else {
                    throw new Error('存在错误的字符！');
                }
                arRslt.push(lexical);
            }
            
        } while (m != null);
        arRslt.push({
            type: '$',
            value: '',
            index: code.length
        });
        return arRslt;
    },
    setValidOperands: function(operands) {
        this.operands = operands;
    },
    isMatch: function(code) {
        const operatorParam = code.map((v, i) => {
            if (v.type === 'operator') {
                v.outerIndex = i;
                return v;
            }
        }).filter(v => v);
        const isMatch = operatorParam.every(v => {
            const { outerIndex } = v;
            return this.handleParam(code[outerIndex - 1], v, code[outerIndex + 1]);
        });

        return isMatch;
    },
    handleParam: function(left, mid, right) {
        const { value: leftValue, index: leftIndex } = left;
        const { value: midValue, index: midIndex } = mid;
        const { value: rightValue, index: rightIndex } = right;
        const leftRule = midIndex >= (leftIndex + leftValue.length + 1);
        const rightRule = rightIndex >= (midIndex + midValue.length + 1);
        return leftRule && rightRule;
    },
    hasChineseInpunt: function(code) {
    // 匹配这些中文标点符号 。 ？ ！ ， 、 ； ： “ ” ‘ ' （ ） 《 》 〈 〉 【 】 『 』 「 」 ﹃ ﹄ 〔 〕 … — ～ ﹏ ￥
        const reg = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
        return reg.test(code);
    }
};

export const SyntaxParser = {
    
    parse: function(lexicals) {
        const stack = [0];
        let prev = '';
        let node = '';
        const errMsg = '';
        lexicals.forEach(function(lexical, index) {
            if (index == 0) {
                return;
            }
            prev = lexicals[index - 1];
            // throw new Error('公式错误')

            switch (prev.type) {
                // 编码类型
                case 'operand':
                    switch (lexical.type) {
                        // and 或者 or 类型
                        case 'operator':
                            if (!ast.fall && ast.type == 'operator' && lexical.value != ast.value) {
                                throw new Error('and与or需要用括号分隔');
                            }
                            lexical.left = ast;
                            ast = stack[stack.length - 1] = lexical;
                            break;
                        // 右括号 
                        case 'limit_end':
                            node = stack.pop();
                            if (stack.length > 0) {
                                ast = stack[stack.length - 1];
                            } else {
                                throw new Error('缺失左括号');
                            }
                            if (ast === 0) {
                                ast = stack[stack.length - 1] = node;
                                ast.fall = true;
                            } else if (ast.type == 'operator') {
                                ast.right = node;
                            } else {
                                throw new Error(errMsg);
                            }
                            break;
                        case '$':
                            break;
                        default:
                            throw new Error(errMsg);
                    }
                    break;
                case 'operator':
                    switch (lexical.type) {
                        case 'operand':
                            // ast = prev;
                            prev.right = lexical;
                            break;
                        case 'limit_start':
                            stack.push(0);
                            break;
                        default:
                            throw new Error(errMsg);
                    }
                    break;
                case 'limit_start':
                    switch (lexical.type) {
                        case 'operand':
                            ast = stack[stack.length - 1] = lexical;
                            break;
                        case 'limit_start':
                            stack.push(0);
                            break;
                        default:
                            throw new Error(errMsg);
                    }
                    break;
                case 'limit_end':
                    switch (lexical.type) {
                        case 'operator':
                            if (!ast.fall && ast.type == 'operator' && lexical.value != ast.value) {
                                throw new Error('缺失左括号');
                            }
                            lexical.left = ast;
                            ast = stack[stack.length - 1] = lexical;
                            break;
                        case 'limit_end':
                            node = stack.pop();
                            if (stack.length > 0) {
                                ast = stack[stack.length - 1];
                            } else {
                                throw new Error('缺失左括号');
                            }
                            if (ast === 0) {
                                ast = stack[stack.length - 1] = node;
                                ast.fall = true;
                            } else if (ast.type == 'operator') {
                                ast.right = node;
                            } else {
                                throw new Error(errMsg);
                            }
                            break;
                        case '$':
                            break;
                        default:
                            throw new Error(errMsg);
                    }
                    break;
                case '^':
                    switch (lexical.type) {
                        case 'operand':
                            if (stack[stack.length - 1] === 0) {
                                ast = stack[stack.length - 1] = lexical;
                            }
                            break;
                        case 'limit_start':
                            stack.push(0);
                            break;
                        case '$':
                            break;
                        default:
                            throw new Error(errMsg);
                    }
                    break;
            }
        });

        if (stack.length != 1) {
            throw new Error('缺失右括号');
        } else {
            return this.ast = ast;
        }
    },
    getString: function() {
        const ast = this.ast;
        const arRslt = [];
        if (!ast) {
            return '';
        }
        return this._ldr(ast).map(function(token) {
            return (token == 'and' || token == 'or') ? ` ${token} ` : token;
        }).join('');
    },
    _ldr: function(ast, operator) {
        if (!ast) return [];
        const expression = this._ldr(ast.left, ast.type == 'operator' ? ast.value : null).concat([ast.value], this._ldr(ast.right, ast.type == 'operator' ? ast.value : null));
        return operator && ast.type == 'operator' && ast.value != operator ? ['('].concat(expression, [')']) : expression;
    }
};