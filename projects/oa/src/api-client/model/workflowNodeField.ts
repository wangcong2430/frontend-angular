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
import { BaseWorkflowNodeField } from './baseWorkflowNodeField';


export interface WorkflowNodeField {
    /**
     * 
     */
    id?: number;
    /**
     * 
     */
    node_id?: number;
    /**
     * 
     */
    key?: string;
    /**
     * 
     */
    default_value?: string;
    /**
     * 
     */
    required?: number;
    /**
     * 
     */
    hide?: number;
    /**
     * 
     */
    order?: number;
    /**
     * 
     */
    class_name?: string;
    /**
     * 
     */
    label?: string;
    /**
     * 
     */
    type?: string;
    /**
     * 
     */
    placeholder?: string;
    /**
     * 
     */
    disabled?: number;
    /**
     * 
     */
    rows?: number;
    /**
     * 
     */
    cols?: number;
    /**
     * 
     */
    description?: string;
    /**
     * 
     */
    max?: number;
    /**
     * 
     */
    min?: number;
    /**
     * 
     */
    max_length?: number;
    /**
     * 
     */
    min_length?: number;
    /**
     * 
     */
    options_key?: string;
    /**
     * 
     */
    hide_expression?: string;
}
