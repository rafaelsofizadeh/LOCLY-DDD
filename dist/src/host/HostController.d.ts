import { HostAccountLink, IGetHostAccountLink } from './application/GetHostAccountLink/IGetHostAccountLink';
import { Host, SerializedHost } from './entity/Host';
import { EditHostRequest, IEditHost } from './application/EditHost/IEditHost';
import { ISetHostAvailability, SetHostAvailabilityRequest } from './application/SetHostAvailability/ISetHostAvailability';
import { IGetHost } from './application/GetHost/IGetHost';
import { IDeleteHost } from './application/DeleteHost/IDeleteHost';
export declare class HostController {
    private readonly getHost;
    private readonly getHostAccountLink;
    private readonly editHost;
    private readonly deleteHost;
    private readonly setHostAvailability;
    constructor(getHost: IGetHost, getHostAccountLink: IGetHostAccountLink, editHost: IEditHost, deleteHost: IDeleteHost, setHostAvailability: ISetHostAvailability);
    getHostController({ id: hostId }: Host): Promise<SerializedHost>;
    getHostAccountLinkController({ stripeAccountId }: Host): Promise<HostAccountLink>;
    editHostController(host: Host, editHostRequest: EditHostRequest): Promise<void>;
    setHostAvailabilityController(host: Host, setHostAvailabilityRequest: SetHostAvailabilityRequest): Promise<void>;
    deleteHostController({ id: hostId }: Host): Promise<void>;
}
