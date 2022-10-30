import http from '@/axios/http'

export const get_perf_score_config = () => {
    return http({
        url: '/web/perf-score/perf-score-config',
        method: 'GET',
    })
}

export const getTcplayerSign = async(file_id: string)=>{
    return await createInterface({
        body: JSON.stringify({ file_id }),
        connector: "GetQcloudVodPlayerSign",
        task_id: getUUid()
    })
}

//获取列表
export function createInterface(data:any){
    return http({
        url:data.connector?`/srv.connector/send_task?con=${data.connector}`:`/srv.model/${data.interfaceType}?schems=${data.schema}`,
        method:'POST',
        data:{
            "project":!data.connector&&"artcool",
            "schema":data.schema,
            "filter":data.filter_str?null:data.filter,
            "filter_str":data.filter_str,
            "sorter":data.sorter,
            "data":data.theData,
            "batch":data.batch,
            "ids":data.ids,
            "page":data.page,
            "page_size":data.page_size,
            "nocache":data.nocache,
            "connector":data.connector&&'artcool.'+data.connector,
            "task_id":data.connector&&getUUid(),
            "env":data.connector&&'dev',
            "body":data.body,
            "relation":data.relation,
            "id":data.id,
        }
    })
}


/* 
  获取UUID, 返回日期拼随机数
*/
export function getUUid(): string {
    // 日期
    const date = () => {
      const month = new Date().getMonth() + 1;
      const day = new Date().getDate();
      return `${month < 10 ? '0' + month : month}${day < 10 ? '0' + day : day}`;
    };
    // 6位随机字母数字
    const subUid = Math.random()
      .toString(36)
      .substring(2)
      .substring(0, 6);
    return date() + '-' + subUid;
  }

  