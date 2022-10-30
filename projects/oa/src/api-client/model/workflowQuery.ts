/**
 * 接口文档
 * Version: __0.0.1__
 *
 * OpenAPI spec version: 0.0.1
 * Contact: binghuiluo@tencent.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface WorkflowQuery {
    /**
     * 每页显示数量
     */
    page_size?: number;
    /**
     * 数据表名
     */
    data_table_name?: string;
    /**
     * 类型
     */
    type?: string;
    /**
     * 查询条件
     */
    conditions?: Array<string>;
    /**
     * 查询页码
     */
    page?: number;
}
