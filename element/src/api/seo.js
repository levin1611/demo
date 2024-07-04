import { Request } from '@/api/baseUtilAjax';

// SEO 智能生成内容
export const SEOGenOptions = {
    language: {
        data: [{
            _id: '60c4eb424660040013ca8a9f',
            isDefault: false,
            name: '🇦🇪 Arabic',
            slug: 'arabic',
            createdAt: '2021-06-12T17:13:38.036Z',
            isNew: false,
            cn: '阿拉伯'
        }, {
            cn: '保加利亚语',
            _id: '60eddd5676319d000c81dfc5',
            isDefault: false,
            name: '🇧🇬 Bulgarian',
            slug: 'bulgarian',
            createdAt: '2021-07-13T18:37:10.288Z',
            isNew: false
        }, {
            _id: '607ae6531208a9000cb1141c',
            isDefault: false,
            name: '🇨🇳 Chinese (S)',
            slug: 'chinese-simplified',
            createdAt: '2021-04-17T13:44:51.796Z',
            isNew: false,
            cn: '中文 (S)'
        }, {
            _id: '60f853a39bb0df0013c6a588',
            isDefault: false,
            name: '🇹🇼 Chinese (T)',
            slug: 'chinese-traditional',
            createdAt: '2021-07-21T17:04:35.626Z',
            isNew: false,
            cn: '中文 (T)'
        }, {
            _id: '60d014e9d6e910001341493a',
            isDefault: false,
            name: '🇨🇿 Czech',
            slug: 'czech',
            createdAt: '2021-06-21T04:26:17.022Z',
            isNew: false,
            cn: '捷克语'
        }, {
            _id: '60c653b4bca5d4000cc679e3',
            isDefault: false,
            name: '🇩🇰 Danish',
            slug: 'danish',
            createdAt: '2021-06-13T18:51:32.326Z',
            isNew: false,
            cn: '丹麦语'
        }, {
            _id: '607adbdf6f8fe5000c1e6378',
            isDefault: false,
            name: '🇳🇱 Dutch',
            slug: 'dutch',
            createdAt: '2021-04-17T13:00:15.980Z',
            isNew: false,
            cn: '荷兰语'
        }, {
            _id: '607adac76f8fe5000c1e636d',
            isDefault: true,
            name: '🇺🇸 English',
            slug: 'english',
            createdAt: '2021-04-17T12:55:35.150Z',
            isNew: false,
            cn: '英文'
        }, {
            _id: '60ebc3e06f90af000c8b15f3',
            isDefault: false,
            name: '🇮🇷 Farsi',
            slug: 'farsi',
            createdAt: '2021-07-12T04:24:00.881Z',
            isNew: false,
            cn: '波斯语'
        }, {
            _id: '6159af6d56a355691567ec9d',
            name: '🇵🇭 Filipino',
            slug: 'filipino',
            isDefault: false,
            createdAt: '2021-10-03T13:26:05.463Z',
            isNew: false,
            cn: '菲律宾语'
        }, {
            _id: '60c65338bca5d4000cc679dd',
            isDefault: false,
            name: '🇫🇮 Finnish',
            slug: 'finnish',
            createdAt: '2021-06-13T18:49:28.530Z',
            isNew: false,
            cn: '芬兰语'
        }, {
            _id: '607adb7b6f8fe5000c1e6375',
            isDefault: false,
            name: '🇫🇷 French',
            slug: 'french',
            createdAt: '2021-04-17T12:58:35.605Z',
            isNew: false,
            cn: '法语'
        }, {
            _id: '607adb536f8fe5000c1e6374',
            isDefault: false,
            name: '🇩🇪 German',
            slug: 'german',
            createdAt: '2021-04-17T12:57:55.882Z',
            isNew: false,
            cn: '德语'
        }, {
            _id: '607adc966f8fe5000c1e637d',
            isDefault: false,
            name: '🇬🇷 Greek',
            slug: 'greek',
            createdAt: '2021-04-17T13:03:18.678Z',
            isNew: false,
            cn: '希腊语'
        }, {
            _id: '607c7c211ebe15000cbbc7b8',
            isDefault: false,
            name: '🇮🇱 Hebrew',
            slug: 'hebrew',
            createdAt: '2021-04-18T18:36:17.271Z',
            isNew: false,
            cn: '希伯来语'
        }, {
            _id: '60ce30891d63cb0013838dfb',
            isDefault: false,
            name: '🇮🇳 Hindi',
            slug: 'hindi',
            createdAt: '2021-06-19T17:59:37.287Z',
            isNew: false,
            cn: '印地语'
        }, {
            _id: '6102aa33280cab000c673c2f',
            isDefault: false,
            name: '🇭🇺 Hungarian',
            slug: 'hungarian',
            createdAt: '2021-07-29T13:16:35.719Z',
            isNew: false,
            cn: '匈牙利语'
        }, {
            _id: '6094f9b4addddd000c04c94b',
            isDefault: false,
            name: '🇮🇩 Indonesian',
            slug: 'indonesian',
            createdAt: '2021-05-07T08:26:28.111Z',
            isNew: false,
            cn: '印尼语'
        }, {
            _id: '607adb996f8fe5000c1e6376',
            isDefault: false,
            name: '🇮🇹 Italian',
            slug: 'italian',
            createdAt: '2021-04-17T12:59:05.429Z',
            isNew: false,
            cn: '意大利语'
        }, {
            _id: '607adc3d6f8fe5000c1e637b',
            isDefault: false,
            name: '🇯🇵 Japanese',
            slug: 'japanese',
            createdAt: '2021-04-17T13:01:49.878Z',
            isNew: false,
            cn: '日语'
        }, {
            _id: '607adc716f8fe5000c1e637c',
            isDefault: false,
            name: '🇰🇷 Korean',
            slug: 'korean',
            createdAt: '2021-04-17T13:02:41.710Z',
            isNew: false,
            cn: '韩语'
        }, {
            _id: '6198d279d3a709c29634bb26',
            name: '🇱🇹 Lithuanian',
            slug: 'lithuanian',
            isDefault: false,
            createdAt: '2021-11-20T10:48:25.124Z',
            isNew: false,
            cn: '立陶宛语'
        }, {
            _id: '60ef33e9c218d0000c2eb058',
            isDefault: false,
            name: '🇲🇾 Malay',
            slug: 'malay',
            createdAt: '2021-07-14T18:58:49.437Z',
            isNew: false,
            cn: '马来语'
        }, {
            _id: '607db96c182478000c9ac2d9',
            isDefault: false,
            name: '🇳🇴 Norwegian',
            slug: 'norwegian',
            createdAt: '2021-04-19T17:10:04.239Z',
            isNew: false,
            cn: '挪威语'
        }, {
            _id: '607adc056f8fe5000c1e6379',
            isDefault: false,
            name: '🇵🇱 Polish',
            slug: 'polish',
            createdAt: '2021-04-17T13:00:53.237Z',
            isNew: false,
            cn: '波兰语'
        }, {
            _id: '607adbb56f8fe5000c1e6377',
            isDefault: false,
            name: '🇵🇹 Portuguese',
            slug: 'portuguese',
            createdAt: '2021-04-17T12:59:33.877Z',
            isNew: false,
            cn: '葡萄牙语'
        }, {
            _id: '609fdbec6cc23d000c7c5e84',
            isDefault: false,
            name: '🇷🇴 Romanian',
            slug: 'romanian',
            createdAt: '2021-05-15T14:34:20.178Z',
            isNew: false,
            cn: '罗马尼亚语'
        }, {
            _id: '607adc2f6f8fe5000c1e637a',
            isDefault: false,
            name: '🇷🇺 Russian',
            slug: 'russian',
            createdAt: '2021-04-17T13:01:35.377Z',
            isNew: false,
            cn: '俄语'
        }, {
            _id: '614a2cc9c1babef3e4008d48',
            name: '🇸🇰 Slovak',
            slug: 'slovak',
            isDefault: false,
            createdAt: '2021-09-21T19:04:41.265Z',
            isNew: false,
            cn: '斯洛伐克语'
        }, {
            _id: '607adad66f8fe5000c1e636e',
            isDefault: false,
            name: '🇪🇸 Spanish',
            slug: 'spanish',
            createdAt: '2021-04-17T12:55:50.976Z',
            isNew: false,
            cn: '西班牙语'
        }, {
            _id: '6081b157f580d2000c1baf2c',
            isDefault: false,
            name: '🇸🇪 Swedish',
            slug: 'swedish',
            createdAt: '2021-04-22T17:24:39.515Z',
            isNew: false,
            cn: '瑞典语'
        }, {
            _id: '607c7bec1ebe15000cbbc7b7',
            isDefault: false,
            name: '🇹🇭 Thai',
            slug: 'thai',
            createdAt: '2021-04-18T18:35:24.722Z',
            isNew: false,
            cn: '泰语'
        }, {
            _id: '60a4c3d60b2ef9000ce86d01',
            isDefault: false,
            name: '🇹🇷 Turkish',
            slug: 'turkish',
            createdAt: '2021-05-19T07:52:54.039Z',
            isNew: false,
            cn: '土耳其语'
        }, {
            _id: '60c65522bca5d4000cc679fa',
            isDefault: false,
            name: '🇻🇳 Vietnamese',
            slug: 'vietnamese',
            createdAt: '2021-06-13T18:57:38.409Z',
            isNew: false,
            cn: '越南语'
        }]
    },
    tones: {
        data: [
            {
                createdAt: '2021-03-22T04:43:33.811Z',
                name: 'Appreciative',
                _id: '6058207530f7b1000c1c4f86',
                isNew: false,
                slug: 'appreciative',
                cn: '欣赏的'
            },
            {
                createdAt: '2021-03-22T04:44:12.712Z',
                name: 'Assertive',
                _id: '6058209c30f7b1000c1c4f88',
                isNew: false,
                slug: 'assertive',
                cn: '断言的'
            },
            {
                createdAt: '2021-03-22T04:51:02.974Z',
                name: 'Awestruck',
                _id: '6058223630f7b1000c1c4f96',
                isNew: false,
                slug: 'awestruck',
                cn: '敬畏'
            },
            {
                createdAt: '2021-03-22T04:44:48.079Z',
                name: 'Candid',
                _id: '605820c030f7b1000c1c4f89',
                isNew: false,
                slug: 'candid',
                cn: '坦率'
            },
            {
                createdAt: '2021-03-21T11:13:39.300Z',
                name: 'Casual',
                _id: '60572a639bdd4272b8fe358a',
                isNew: false,
                slug: 'casual',
                cn: '随意的'
            },
            {
                createdAt: '2021-03-22T04:45:08.637Z',
                name: 'Cautionary',
                _id: '605820d430f7b1000c1c4f8a',
                isNew: false,
                slug: 'cautionary',
                cn: '警示'
            },
            {
                createdAt: '2021-03-22T04:45:23.929Z',
                name: 'Compassionate',
                _id: '605820e330f7b1000c1c4f8b',
                isNew: false,
                slug: 'compassionate',
                cn: '富有同情心'
            },
            {
                createdAt: '2021-03-21T11:13:39.792Z',
                isDefault: true,
                name: 'Convincing',
                _id: '60572a639bdd4272b8fe358b',
                isNew: false,
                slug: 'convincing',
                cn: '令人信服'
            },
            {
                createdAt: '2021-07-10T09:59:05.843Z',
                isDefault: false,
                name: 'Critical',
                _id: '60e96f6992161b0013c6ae4a',
                isNew: false,
                slug: 'critical',
                cn: '批判的'
            },
            {
                createdAt: '2021-03-22T04:46:32.211Z',
                name: 'Earnest',
                _id: '6058212830f7b1000c1c4f8d',
                isNew: false,
                slug: 'earnest',
                cn: '认真'
            },
            {
                createdAt: '2021-03-22T04:46:48.471Z',
                name: 'Enthusiastic',
                _id: '6058213830f7b1000c1c4f8e',
                isNew: false,
                slug: 'enthusiastic',
                cn: '热情的'
            },
            {
                createdAt: '2021-03-22T04:41:44.800Z',
                name: 'Formal',
                _id: '6058200830f7b1000c1c4f85',
                isNew: false,
                slug: 'formal',
                cn: '正式的'
            },
            {
                createdAt: '2021-03-21T11:13:40.094Z',
                name: 'Funny',
                _id: '60572a649bdd4272b8fe358c',
                isNew: false,
                slug: 'funny',
                cn: '有趣的'
            },
            {
                createdAt: '2021-03-22T04:47:21.523Z',
                name: 'Humble',
                _id: '6058215930f7b1000c1c4f8f',
                isNew: false,
                slug: 'humble',
                cn: '谦逊的'
            },
            {
                createdAt: '2021-03-22T04:47:35.727Z',
                name: 'Humorous',
                _id: '6058216730f7b1000c1c4f90',
                isNew: false,
                slug: 'humorous',
                cn: '幽默'
            },
            {
                createdAt: '2021-07-27T04:36:10.578Z',
                isDefault: false,
                name: 'Informative',
                _id: '60ff8d3afc873e000c08e8b2',
                isNew: false,
                slug: 'informative',
                cn: '内容丰富'
            },
            {
                createdAt: '2021-03-31T18:58:47.885Z',
                name: 'Inspirational',
                _id: '6064c6679bde74000cea994c',
                isNew: false,
                slug: 'inspirational',
                cn: '励志'
            },
            {
                createdAt: '2021-03-22T04:48:16.214Z',
                name: 'Joyful',
                _id: '6058219030f7b1000c1c4f92',
                isNew: false,
                slug: 'joyful',
                cn: '快乐'
            },
            {
                createdAt: '2021-03-22T04:43:51.224Z',
                name: 'Passionate',
                _id: '6058208730f7b1000c1c4f87',
                isNew: false,
                slug: 'passionate',
                cn: '热情的'
            },
            {
                createdAt: '2021-03-22T04:49:04.430Z',
                name: 'Thoughtful',
                _id: '605821c030f7b1000c1c4f93',
                isNew: false,
                slug: 'thoughtful',
                cn: '周到'
            },
            {
                createdAt: '2021-03-22T04:49:16.310Z',
                name: 'Urgent',
                _id: '605821cc30f7b1000c1c4f94',
                isNew: false,
                slug: 'urgent',
                cn: '紧迫的'
            },
            {
                createdAt: '2021-03-22T04:49:36.552Z',
                name: 'Worried',
                _id: '605821e030f7b1000c1c4f95',
                isNew: false,
                slug: 'worried',
                cn: '担心'
            }
        ]
    },
    sence: [
        {
            cn: '博客标题和大纲',
            image: '1626880951898.svg',
            caption: 'Generate ideas and content structure for articles',
            description: 'The easiest way to come up with catchy blog, essay, and article topics and content structures using AI writing assistant',
            contextInputs: [
                {
                    inputMaximumCharacters: 100,
                    isRequired: true,
                    inputType: 'textarea',
                    label: '主要关键词',
                    placeholder: 'AI writing assistant',
                    _id: '60a40cf5da9d76000ccc2829',
                    keyLabel: 'PRIMARY_KEYWORD_LABEL'
                }
            ],
            variants: '1',
            isNew: false,
            createdAt: '2021-05-18T18:52:37.355Z',
            name: 'Blog Idea & Outline',
            isCustom: false,
            _id: '60a40cf5da9d76000ccc2828',
            slug: 'blog-idea-outline',
            key: 'blog-idea-outline',
            info: ''
        },
        {
            cn: '博客章节精写',
            image: '1620388926083.svg',
            description: 'Write engaging introduction and section paragraphs for your blog',
            caption: 'Write articles based on section topics & headlines',
            contextInputs: [
                {
                    inputMaximumCharacters: 125,
                    isRequired: true,
                    inputType: 'text',
                    label: '子主题',
                    placeholder: 'Role of AI Writers in the Future of Copywriting',
                    _id: '60584cf2c2cdaa000c2a7955',
                    keyLabel: 'SECTION_TOPIC_LABEL'
                },
                {
                    inputMaximumCharacters: 125,
                    isRequired: false,
                    inputType: 'textarea',
                    label: '子主题关键词',
                    placeholder: 'ai writer, blog generator, best writing software',
                    _id: '612772a98e8d7c56540a5be1',
                    keyLabel: 'SECTION_KEYWORDS_LABEL'
                }
            ],
            variants: '1',
            isNew: false,
            createdAt: '2021-03-22T07:53:22.873Z',
            name: 'Blog Section Writing',
            isCustom: false,
            _id: '60584cf2c2cdaa000c2a7954',
            slug: 'blog-writing',
            key: 'blog-paragraph',
            info: ''
        },
        {
            cn: 'SEO元标题',
            image: '1620395299663.svg',
            description: 'Write SEO optimized meta titles for your website and blog posts',
            caption: 'Generate SEO-friendly meta title for the page',
            contextInputs: [
                {
                    inputMaximumCharacters: 50,
                    isRequired: true,
                    inputType: 'textarea',
                    label: '目标关键字',
                    placeholder: 'Rytr - Best AI Writer, Content Generator & Writing Assistant',
                    _id: '60583ac98c0a4a000c69c970',
                    keyLabel: 'PAGE_META_TITLE_LABEL'
                }
            ],
            variants: '1',
            isNew: false,
            createdAt: '2021-03-22T06:32:37.680Z',
            name: 'SEO Meta Title',
            isCustom: false,
            _id: '60583a058c0a4a000c69c96d',
            slug: 'seo-title',
            key: 'seo-title',
            info: '',
            reqiure: 'setting'
        },
        {
            cn: 'SEO元描述',
            image: '1620395291088.svg',
            description: 'Write SEO optimized meta description content for any page, blog, or website',
            caption: 'Generate SEO-friendly meta description for the page',
            contextInputs: [
                {
                    inputMaximumCharacters: 75,
                    isRequired: true,
                    inputType: 'text',
                    label: '页面元标题',
                    placeholder: 'AI writing assistant, content generator',
                    _id: '60583a058c0a4a000c69c96e',
                    keyLabel: 'TARGET_KEYWORDS_LABEL'
                }
            ],
            variants: '1',
            isNew: false,
            createdAt: '2021-03-22T06:35:53.193Z',
            name: 'SEO Meta Description',
            isCustom: false,
            _id: '60583ac98c0a4a000c69c96f',
            slug: 'seo-description',
            key: 'seo-description',
            info: '',
            reqiure: 'setting'
        }
    ],
    variants: ['1', '2', '3'],
    creativity: [
        { cn: '最佳', value: 'default' },
        { cn: '无（更真实)', value: 'none' },
        { cn: '中', value: 'medium' },
        { cn: '低', value: 'low' },
        { cn: '高', value: 'high' },
        { cn: '最大（不那么真实）', value: 'max' }
    ],
    model: [{ value: 'GPT 3.5', label: 'GPT 3.5' }]
};

// 获取主题列表
export const getTopicData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/seotopic/all',
        data
    }, 'post').init(success, error, cbs);
};

// seo生成内容接口
export const getContentBySeo = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/oversea/rytr/createContent',
        data,
        timeout: 10000
    }, 'post').init(success, error, cbs);
};

// seo生成内容接口
export const addTopicChild = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/seotopic/create',
        data
    }, 'post').init(success, error, cbs);
};

/* seo生成文章相关 */
// 获取"自动生成文章"功能的大致设置信息
export const getAutoGenArtSetting = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/agp/site/init',
        data
    }, 'post').init(success, error, cbs);
};

// 获取"自动生成文章"功能的任务统计信息概览数据
export const getGenArtTaskStatData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMPJson',
        url: '/agp/task/overview',
        data
    }, 'post').init(success, error, cbs);
};

// 获取"自动生成文章"功能的任务表格数据
export const getGenArtTaskTableData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMPJson',
        url: '/agp/task/list',
        data
    }, 'post').init(success, error, cbs);
};

// 删除"自动生成文章"任务
export const deleteGenArtTask = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/agp/task/delete',
        data
    }, 'post').init(success, error, cbs);
};

// 还原删除"自动生成文章"任务
export const revertDeleteGenArtTask = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/agp/task/recover',
        data
    }, 'post').init(success, error, cbs);
};

// 保存新建的自动生成文章任务
export const saveGenArtTask = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMPJson',
        url: '/agp/task/create',
        data
    }, 'post').init(success, error, cbs);
};

// 保存新建自动生成文章任务的草稿
export const saveGenArtTaskDraft = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMPJson',
        url: '/agp/task/draft',
        data
    }, 'post').init(success, error, cbs);
};

// 获取所有 AMP 站和营销站
export const getAllSiteList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/agp/site/list',
        data
    }, 'post').init(success, error, cbs);
};

// 获取 AMP 站下的网页数据
export const getAmpSiteUrlList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/page/getUrlSelector',
        data
    }, 'post').init(success, error, cbs);
};

// 获取营销站下的网页数据
export const getMarketingSiteUrlList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/page/getSitePage',
        data
    }, 'post').init(success, error, cbs);
};

// 获取自动生成文章任务详情
export const getGenArtTaskDetailData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/agp/task/detail',
        data
    }, 'post').init(success, error, cbs);
};

// 获取自动生成文章任务详情 - 统计数据
export const getGenArtTaskDetailStatData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMPJson',
        url: '/agp/post/overview',
        data
    }, 'post').init(success, error, cbs);
};

// 获取自动生成文章任务下的文章列表
export const getArticleTableData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMPJson',
        url: '/agp/post/list',
        data
    }, 'post').init(success, error, cbs);
};

// 删除自动生成的文章
export const deleteArticle = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/agp/post/delete',
        data
    }, 'post').init(success, error, cbs);
};

// 删除自动生成的文章
export const recoverArticle = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/agp/post/recover',
        data
    }, 'post').init(success, error, cbs);
};

// 获取自动生成的文章的详细信息
export const getArtDetail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/agp/post/detail',
        data
    }, 'post').init(success, error, cbs);
};

// 文章存草稿
export const saveArtDraft = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMPJson',
        url: '/agp/post/draft',
        data
    }, 'post').init(success, error, cbs);
};

// 发布文章
export const publishArt = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMPJson',
        url: '/agp/post/publish',
        data
    }, 'post').init(success, error, cbs);
};

// 发布文章
export const publishArtAMP = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMPJson',
        url: `/agp/post/publish?site_id=${data.siteId}`,
        data
    }, 'post').init(success, error, cbs);
};

// 获取 AMP 站新闻分类
export const getAmpNewsCategoryData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/category/getAllList',
        data
    }, 'post').init(success, error, cbs);
};

// 获取营销站文章分类
export const getMarketingArtCategoryData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAMP',
        url: '/agp/site/category',
        data
    }, 'post').init(success, error, cbs);
};
