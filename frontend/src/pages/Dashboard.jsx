
import { Appbar } from "../components/Appbar";
import { Users } from "../components/User";
import { Balance } from "../components/Balance";

export const Dashboard = ()=>{
    return <div>
        <Appbar />
        <div className="m-8">
            <Balance value={"10,000"} />
            <Users />
        </div>
    </div>
}