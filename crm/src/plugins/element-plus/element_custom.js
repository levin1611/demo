// 修改 element-plus 组件默认值
import { ElTooltip, ElInput, ElLink } from 'element-plus';
ElTooltip.props.showAfter.default = 500;
ElTooltip.props.appendTo.default = 'body';
ElInput.props.clearable.default = true;
ElLink.props.underline.default = false;
